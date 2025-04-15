import { useState, useEffect, useCallback, useRef } from 'react';
import { Trade, WalletTrade, TradeBlock } from '../types/trades';
import { TRACKED_WALLETS } from '../utils/api';

// API base URL - change based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// WebSocket URL with explicit IP address
const WS_BASE_URL = 'ws://192.168.1.100:5000';

export function useHyperliquidTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [walletTrades, setWalletTrades] = useState<WalletTrade[]>([]);
  const [tradeBlocks, setTradeBlocks] = useState<TradeBlock[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 5;
  const tradeCount = useRef(0);
  const totalTransactions = useRef(0);
  const lastBlockTimestamp = useRef<number | null>(null);
  const blockTransactions = useRef<Trade[]>([]);
  const blockCreateInterval = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Helper to format the trade blocks similar to the screenshot
  const formatTradeBlock = useCallback((tradeData: Trade[]): TradeBlock => {
    // Use the timestamp of the first trade in this block
    const timestamp = Math.floor(tradeData[0].time / 1000);
    
    // Create a block hash similar to the ones in the screenshot
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const generateHash = () => {
      let hash = '0x';
      for (let i = 0; i < 64; i++) {
        hash += randomHex();
      }
      return hash;
    };
    
    // Use sequential block numbers decreasing to match the screenshot
    const blockNumber = 534640529 - tradeCount.current;
    tradeCount.current += 1;
    
    // Track overall transaction count 
    totalTransactions.current += tradeData.length;
    
    return {
      blockNumber,
      timestamp,
      hash: generateHash(),
      transactions: tradeData.length,
      totalSoFar: totalTransactions.current, // Add this to help with total tracking
    };
  }, []);

  // Create and flush a trade block
  const createTradeBlock = useCallback(() => {
    if (blockTransactions.current.length > 0) {
      const newBlock = formatTradeBlock([...blockTransactions.current]);
      
      setTradeBlocks(prev => {
        // Limit to 6 blocks for display
        const updated = [newBlock, ...prev].slice(0, 6);
        return updated;
      });
      
      // Reset the current block transactions
      blockTransactions.current = [];
    }
  }, [formatTradeBlock]);

  // Process trades, grouping them into blocks with multiple transactions
  const processTrade = useCallback((newTrade: Trade) => {
    // Add new trade to the list of all trades
    setTrades(prev => {
      // Keep last 200 trades
      const updated = [newTrade, ...prev].slice(0, 200);
      return updated;
    });
    
    // Current timestamp in seconds
    const tradeTimeSec = Math.floor(newTrade.time / 1000);
    
    // If this is our first trade or if we've crossed a 500ms boundary since the last trade,
    // start a new block
    if (
      lastBlockTimestamp.current === null || 
      tradeTimeSec !== lastBlockTimestamp.current
    ) {
      // If we have pending transactions, create a block with them first
      if (blockTransactions.current.length > 0) {
        createTradeBlock();
      }
      
      // Start a new block with this trade
      lastBlockTimestamp.current = tradeTimeSec;
      blockTransactions.current.push(newTrade);
      
      // Schedule a flush of this block in 100ms if it doesn't fill up
      if (blockCreateInterval.current) {
        clearTimeout(blockCreateInterval.current);
      }
      
      blockCreateInterval.current = setTimeout(() => {
        createTradeBlock();
        blockCreateInterval.current = null;
      }, 100);
    } else {
      // Add to the current block
      blockTransactions.current.push(newTrade);
      
      // If we've accumulated enough trades in this block, create it immediately
      if (blockTransactions.current.length >= 10) {
        if (blockCreateInterval.current) {
          clearTimeout(blockCreateInterval.current);
          blockCreateInterval.current = null;
        }
        createTradeBlock();
      }
    }
  }, [createTradeBlock]);

  // Process wallet trades immediately
  const processWalletTrade = useCallback((newTrade: WalletTrade) => {
    setWalletTrades(prev => {
      // Keep last 10 wallet trades
      const updated = [newTrade, ...prev].slice(0, 10);
      return updated;
    });
  }, []);

  // Connect to WebSocket and set up listeners
  useEffect(() => {
    console.log("Connecting to server websocket...");
    
    const handleTrade = (trade: Trade) => {
      processTrade(trade);
    };

    const handleWalletTrade = (trade: WalletTrade) => {
      processWalletTrade(trade);
    };

    const connect = async () => {
      setLoading(true);
      setError(null);
      
      if (connectionAttempts.current >= maxConnectionAttempts) {
        setError(`Failed to connect after ${maxConnectionAttempts} attempts. Please refresh the page to try again.`);
        setLoading(false);
        return () => {};
      }
      
      connectionAttempts.current++;
      
      try {
        console.log(`Connecting to WebSocket at ${WS_BASE_URL}`);
        // Connect to our server's WebSocket using the explicit URL
        const ws = new WebSocket(WS_BASE_URL);
        
        ws.onopen = () => {
          console.log("Successfully connected to server websocket");
          connectionAttempts.current = 0;
          setConnected(true);
          setLoading(false);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'trades') {
              data.data.forEach((trade: Trade) => {
                handleTrade(trade);
              });
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed");
          setConnected(false);
          // Attempt to reconnect
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
          }
          reconnectTimeout.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${connectionAttempts.current}/${maxConnectionAttempts})...`);
            cleanup.then(cleanupFn => cleanupFn());
            connect();
          }, 3000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setLoading(false);
          setConnected(false);
        };

        socketRef.current = ws;
        
        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
          }
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setError(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
        setConnected(false);
        
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        
        reconnectTimeout.current = setTimeout(() => {
          console.log(`Attempting to reconnect (${connectionAttempts.current}/${maxConnectionAttempts})...`);
          cleanup.then(cleanupFn => cleanupFn());
          connect();
        }, 3000);
        
        return () => {
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current);
            reconnectTimeout.current = null;
          }
        };
      }
    };

    const cleanup = connect();
    
    return () => {
      cleanup.then(cleanupFn => {
        if (typeof cleanupFn === 'function') {
          cleanupFn();
        }
        
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }
      });
    };
  }, [processTrade, processWalletTrade, createTradeBlock]);

  return {
    trades,
    walletTrades,
    tradeBlocks,
    connected,
    loading,
    error,
    trackedWallets: TRACKED_WALLETS,
    transactionCount: totalTransactions.current,
  };
} 