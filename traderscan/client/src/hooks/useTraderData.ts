"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, Trader, TraderAnalytics, Perpetual } from '../types';
import { fetchAnalytics, fetchTraders, fetchPerpetuals } from '../utils/api';

interface TraderDataState {
  traders: Trader[];
  analytics: TraderAnalytics | null;
  perpetuals: Perpetual[];
  isLoading: boolean;
  isRefreshing: boolean;
  loadingProgress: number;
  error: string | null;
  lastUpdated: string | null;
  fromCache: boolean;
  cacheAge: number | null;
}

export const useTraderData = (includeTradersData = false) => {
  const [state, setState] = useState<TraderDataState>({
    traders: [],
    analytics: null,
    perpetuals: [],
    isLoading: true,
    isRefreshing: false,
    loadingProgress: 0,
    error: null,
    lastUpdated: null,
    fromCache: false,
    cacheAge: null
  });

  // Store event source as ref
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string>(Date.now().toString());
  
  // Connect to SSE stream for real-time progress
  const connectToProgressStream = useCallback(() => {
    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const progressUrl = `${API_BASE_URL}/traders/progress/${clientIdRef.current}`;
    
    console.log(`Connecting to progress stream at ${progressUrl}`);
    
    const eventSource = new EventSource(progressUrl);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log('Connected to progress stream');
    };
    
    eventSource.onerror = (error) => {
      console.error('Error with progress stream:', error);
      eventSource.close();
      eventSourceRef.current = null;
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Progress update:', data);
        
        if (data.event === 'progress') {
          // Update progress state with actual progress from server
          setState(prev => ({ 
            ...prev, 
            loadingProgress: data.percentage 
          }));
        }
      } catch (error) {
        console.error('Error parsing progress event:', error);
      }
    };
    
    return eventSource;
  }, []);
  
  // Disconnect from SSE stream
  const disconnectFromProgressStream = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('Disconnecting from progress stream');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Fetch data function
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: !prev.analytics, 
        isRefreshing: !!prev.analytics, 
        error: null,
        loadingProgress: 0 // Start with 0% progress
      }));

      // Connect to progress stream for real-time updates
      connectToProgressStream();

      // Fetch traders or analytics based on what's needed
      const apiData: ApiResponse = includeTradersData 
        ? await fetchTraders(forceRefresh) 
        : await fetchAnalytics(forceRefresh);
      
      // Disconnect from progress stream as we're done
      disconnectFromProgressStream();

      // Set progress to 100% when complete
      setState(prev => ({
        ...prev,
        traders: apiData.traders || [],
        analytics: apiData.analytics,
        isLoading: false,
        isRefreshing: false,
        loadingProgress: 100, // Completed
        lastUpdated: new Date().toISOString(),
        fromCache: apiData.fromCache,
        cacheAge: apiData.cacheAge || null
      }));
      
      // Reset progress after animation completes
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loadingProgress: 0
        }));
      }, 500);
    } catch (error) {
      // Disconnect from progress stream on error
      disconnectFromProgressStream();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        loadingProgress: 0,
        error: 'Failed to fetch trader data'
      }));
    }
  }, [includeTradersData, connectToProgressStream, disconnectFromProgressStream]);

  // Fetch perpetuals function
  const fetchPerpetualsData = useCallback(async () => {
    try {
      const perpetuals = await fetchPerpetuals();
      setState(prev => ({ ...prev, perpetuals }));
    } catch (error) {
      console.error('Error fetching perpetuals:', error);
      // Don't set error state as perpetuals are less critical
    }
  }, []);

  // Initial data loading - REMOVED AUTO-REFRESH INTERVAL
  useEffect(() => {
    // Load data once on component mount
    fetchData();
    fetchPerpetualsData();
    
    // No interval setup - removing automatic refresh
    // Data will only refresh on initial load or manual refresh
    
    // Clean up event source on unmount
    return () => {
      disconnectFromProgressStream();
    };
  }, [fetchData, fetchPerpetualsData, disconnectFromProgressStream]);

  // Expose refresh function to manually trigger refresh
  const refreshData = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    ...state,
    refreshData
  };
}; 