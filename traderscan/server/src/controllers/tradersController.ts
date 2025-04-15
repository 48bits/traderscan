import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import hyperliquidService from '../services/hyperliquidService';
import analyticsService from '../services/analyticsService';
import { Trader, TraderAnalytics } from '../types';

// File path for storing wallet addresses
const WALLETS_FILE_PATH = path.join(__dirname, '../../data/wallets.json');
// File path for caching trader data
const CACHE_FILE_PATH = path.join(__dirname, '../../data/tradersCache.json');
// Cache TTL in milliseconds (30 minutes - increased from 10 minutes)
const CACHE_TTL = 30 * 60 * 1000;

// Store active SSE clients for progress updates
const clients: Map<string, Response> = new Map();

// Ensure data directory exists
const dataDir = path.dirname(WALLETS_FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Default wallets if none are provided
const DEFAULT_WALLETS: string[] = [];

// Helper to load wallet addresses
const loadWalletAddresses = (): string[] => {
  try {
    if (fs.existsSync(WALLETS_FILE_PATH)) {
      const data = fs.readFileSync(WALLETS_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
    return DEFAULT_WALLETS;
  } catch (error) {
    console.error('Error loading wallet addresses:', error);
    return DEFAULT_WALLETS;
  }
};

// Helper to save wallet addresses
const saveWalletAddresses = (addresses: string[]): void => {
  try {
    fs.writeFileSync(WALLETS_FILE_PATH, JSON.stringify(addresses, null, 2));
  } catch (error) {
    console.error('Error saving wallet addresses:', error);
  }
};

// Helper to load cached trader data
const loadCachedTraderData = (): { data: Trader[], timestamp: number } | null => {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const data = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading cached trader data:', error);
    return null;
  }
};

// Helper to save trader data to cache
const saveTradersToCache = (traders: Trader[]): void => {
  try {
    const cacheData = {
      data: traders,
      timestamp: Date.now()
    };
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error('Error saving traders to cache:', error);
  }
};

// Connect client to SSE stream for real-time progress updates
export const progressStream = (req: Request, res: Response): void => {
  const clientId = req.params.clientId || Date.now().toString();
  
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ event: 'connected', clientId })}\n\n`);
  
  // Store client connection
  clients.set(clientId, res);
  
  console.log(`Client ${clientId} connected to progress stream. Total clients: ${clients.size}`);
  
  // Set up event listener for progress events
  const progressListener = (progress: any) => {
    res.write(`data: ${JSON.stringify({ event: 'progress', ...progress })}\n\n`);
  };
  
  hyperliquidService.progressEmitter.on('progress', progressListener);
  
  // Handle client disconnect
  req.on('close', () => {
    hyperliquidService.progressEmitter.off('progress', progressListener);
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected from progress stream. Remaining clients: ${clients.size}`);
  });
};

// Get all trader positions, using cache if available and not expired
export const getTraders = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log detailed information about the request to help debug what's triggering API calls
    console.log(`[${new Date().toISOString()}] GET /traders request received`);
    console.log(`Client IP: ${req.ip}`);
    console.log(`User Agent: ${req.headers['user-agent']}`);
    console.log(`Query params: ${JSON.stringify(req.query)}`);
    
    const forceRefresh = req.query.refresh === 'true';
    console.log(`Force refresh requested: ${forceRefresh}`);
    
    const cachedData = loadCachedTraderData();
    const cacheAge = cachedData ? Date.now() - cachedData.timestamp : null;
    
    console.log(`Cache status: ${cachedData ? 'Available' : 'Not available'}`);
    if (cachedData) {
      console.log(`Cache age: ${cacheAge ? Math.round(cacheAge / 1000 / 60) : 'N/A'} minutes`);
      console.log(`Cache expiry: ${CACHE_TTL / 1000 / 60} minutes`);
    }
    
    // Use cached data if available, not expired, and not forced to refresh
    if (!forceRefresh && cachedData && (cacheAge! < CACHE_TTL)) {
      console.log('Using cached trader data - NO API calls to Hyperliquid will be made');
      const analytics = analyticsService.generateAnalytics(cachedData.data);
      res.json({
        traders: cachedData.data,
        analytics,
        fromCache: true,
        cacheAge
      });
      return;
    }
    
    // Log that we're making API calls to Hyperliquid
    if (forceRefresh) {
      console.log('Forced refresh requested - will make API calls to Hyperliquid');
    } else if (cachedData && cacheAge! >= CACHE_TTL) {
      console.log('Cache expired - will make API calls to Hyperliquid');
    } else {
      console.log('No cache available - will make API calls to Hyperliquid');
    }
    
    // Load wallet addresses
    const addresses = loadWalletAddresses();
    
    if (addresses.length === 0) {
      res.status(400).json({ error: 'No wallet addresses are configured' });
      return;
    }
    
    // Fetch fresh data from API
    console.log(`Fetching positions for ${addresses.length} wallets`);
    const traders = await hyperliquidService.fetchMultipleTraderPositions(addresses);
    
    // Save to cache
    saveTradersToCache(traders);
    console.log(`Saved new data to cache at ${new Date().toISOString()}`);
    
    // Generate analytics
    const analytics = analyticsService.generateAnalytics(traders);
    
    res.json({
      traders,
      analytics,
      fromCache: false
    });
  } catch (error) {
    console.error('Error fetching trader data:', error);
    res.status(500).json({ error: 'Failed to fetch trader data' });
  }
};

// Get analytics only
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log detailed information about the request
    console.log(`[${new Date().toISOString()}] GET /traders/analytics request received`);
    console.log(`Client IP: ${req.ip}`);
    console.log(`User Agent: ${req.headers['user-agent']}`);
    console.log(`Query params: ${JSON.stringify(req.query)}`);
    
    const forceRefresh = req.query.refresh === 'true';
    console.log(`Force refresh requested: ${forceRefresh}`);
    
    const cachedData = loadCachedTraderData();
    const cacheAge = cachedData ? Date.now() - cachedData.timestamp : null;
    
    console.log(`Cache status: ${cachedData ? 'Available' : 'Not available'}`);
    if (cachedData) {
      console.log(`Cache age: ${cacheAge ? Math.round(cacheAge / 1000 / 60) : 'N/A'} minutes`);
      console.log(`Cache expiry: ${CACHE_TTL / 1000 / 60} minutes`);
    }
    
    // Use cached data if available, not expired, and not forced to refresh
    if (!forceRefresh && cachedData && (cacheAge! < CACHE_TTL)) {
      console.log('Using cached trader data for analytics - NO API calls to Hyperliquid will be made');
      const analytics = analyticsService.generateAnalytics(cachedData.data);
      res.json({
        analytics,
        fromCache: true,
        cacheAge
      });
      return;
    }
    
    // Log that we're making API calls to Hyperliquid
    if (forceRefresh) {
      console.log('Forced refresh requested - will make API calls to Hyperliquid');
    } else if (cachedData && cacheAge! >= CACHE_TTL) {
      console.log('Cache expired - will make API calls to Hyperliquid');
    } else {
      console.log('No cache available - will make API calls to Hyperliquid');
    }
    
    // Need to fetch fresh data
    const addresses = loadWalletAddresses();
    
    if (addresses.length === 0) {
      res.status(400).json({ error: 'No wallet addresses are configured' });
      return;
    }
    
    // Fetch fresh data from API
    console.log(`Fetching positions for ${addresses.length} wallets for analytics`);
    const traders = await hyperliquidService.fetchMultipleTraderPositions(addresses);
    
    // Save to cache
    saveTradersToCache(traders);
    console.log(`Saved new data to cache at ${new Date().toISOString()}`);
    
    // Generate analytics
    const analytics = analyticsService.generateAnalytics(traders);
    
    res.json({
      analytics,
      fromCache: false
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
};

// Get perpetuals information
export const getPerpetuals = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`[${new Date().toISOString()}] GET /traders/perpetuals request received`);
    
    const perpetuals = await hyperliquidService.fetchPerpetuals();
    res.json(perpetuals);
  } catch (error) {
    console.error('Error fetching perpetuals:', error);
    res.status(500).json({ error: 'Failed to fetch perpetuals' });
  }
};

// Submit wallet addresses
export const submitWallets = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`[${new Date().toISOString()}] POST /traders/wallets request received`);
    
    const { addresses } = req.body;
    
    if (!Array.isArray(addresses)) {
      res.status(400).json({ error: 'Addresses must be provided as an array' });
      return;
    }
    
    // Validate addresses format
    const validAddresses = addresses.filter(addr => typeof addr === 'string' && addr.trim().length > 0);
    
    if (validAddresses.length === 0) {
      res.status(400).json({ error: 'No valid addresses provided' });
      return;
    }
    
    // Save addresses
    saveWalletAddresses(validAddresses);
    console.log(`Saved ${validAddresses.length} wallet addresses`);
    
    res.json({
      message: `Successfully saved ${validAddresses.length} wallet addresses`,
      count: validAddresses.length
    });
  } catch (error) {
    console.error('Error saving wallet addresses:', error);
    res.status(500).json({ error: 'Failed to save wallet addresses' });
  }
};

export default {
  getTraders,
  getAnalytics,
  getPerpetuals,
  submitWallets,
  progressStream
}; 