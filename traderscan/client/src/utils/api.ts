import axios from 'axios';
import { ApiResponse, Perpetual } from '../types';
import { Trade, WalletTrade } from '../types/trades';

// API base URL - change based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// List of traders addresses we want to track
export const TRACKED_WALLETS: string[] = [];

/**
 * Fetches trader analytics data
 */
export const fetchAnalytics = async (forceRefresh = false): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/traders/analytics`, {
      params: { refresh: forceRefresh }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('Failed to fetch analytics data');
  }
};

/**
 * Fetches all trader data including positions
 */
export const fetchTraders = async (forceRefresh = false): Promise<ApiResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/traders`, {
      params: { refresh: forceRefresh }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching traders:', error);
    throw new Error('Failed to fetch trader data');
  }
};

/**
 * Fetches perpetuals information
 */
export const fetchPerpetuals = async (): Promise<Perpetual[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/traders/perpetuals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching perpetuals:', error);
    throw new Error('Failed to fetch perpetuals');
  }
};

/**
 * Submits wallet addresses to track
 */
export const submitWallets = async (wallets: string[]): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/traders/wallets`, { wallets });
  } catch (error) {
    console.error('Error submitting wallets:', error);
    throw new Error('Failed to submit wallet addresses');
  }
};

// Full list of trading pairs on Hyperliquid
const ALL_TRADING_PAIRS = [
  'BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'DOGE', 'ADA', 'AVAX', 'MATIC', 'LINK', 
  'DOT', 'LTC', 'ATOM', 'UNI', 'ETC', 'FIL', 'APE', 'AAVE', 'CRV', 'COMP',
  'ARB', 'OP', 'NEAR', 'APT', 'BLUR', 'BONK', 'JTO', 'PEPE', 'MEME', 'SHIB',
  'INJ', 'SUI', 'JUP', 'WIF', 'SEI', 'STRK', 'RNDR', 'FET', 'HYPE'
];

export class HyperliquidWebSocketAPI {
  private socket: WebSocket | null = null;
  private pendingSubscriptions: any[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15; // increased from 10
  private reconnectDelay = 1000;
  private isConnected = false;
  private messageCallbacks: ((data: any) => void)[] = [];
  private tradeCallbacks: ((trade: Trade) => void)[] = [];
  private walletTradeCallbacks: ((trade: WalletTrade) => void)[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize the wallet list from environment or from the CSV file
    this.loadWalletList();
  }

  private loadWalletList() {
    // Clear the current list
    TRACKED_WALLETS.length = 0;
    
    try {
      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        // Try to load from localStorage if available
        const storedWallets = localStorage.getItem('trackedWallets');
        if (storedWallets) {
          const wallets = JSON.parse(storedWallets);
          if (Array.isArray(wallets) && wallets.length > 0) {
            wallets.forEach(wallet => {
              if (typeof wallet === 'string' && wallet.startsWith('0x')) {
                TRACKED_WALLETS.push(wallet.toLowerCase());
              }
            });
            console.log(`Loaded ${TRACKED_WALLETS.length} wallets from localStorage`);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error loading wallets from localStorage:', error);
    }
    
    // If we couldn't load from localStorage or aren't in browser, use the fallback hardcoded wallets
    console.log('Using fallback wallet list');
    // These wallets will only be used if we can't load from file/localStorage
    const fallbackWallets = [
      '0x20c2d95a3dfdca9e9ad12794d5fa6fad99da44f5',
      '0xecb63caa47c7c4e77f60f1ce858cf28dc2b82b00',
      '0x8cc94dc843e1ea7a19805e0cca43001123512b6a',
      '0xe4d31c2541a9ce596419879b1a46ffc7cd202c62',
      '0x45d26f28196d226497130c4bac709d808fed4029',
      '0x8e096995c3e4a3f0bc5b3ea1cba94de2aa4d70c9',
      '0x7fdafde5cfb5465924316eced2d3715494c517d1',
      '0x8af700ba841f30e0a3fcb0ee4c4a9d223e1efa05',
      '0x023a3d058020fb76cca98f01b3c48c8938a22355',
      '0x56498e5f90c14060499b62b6f459b3e3fb9280c5'
    ];
    
    fallbackWallets.forEach(wallet => TRACKED_WALLETS.push(wallet.toLowerCase()));
  }

  private setupHeartbeat() {
    // Send a ping/heartbeat every 30 seconds to keep the connection alive
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        // Send a ping message
        this.socket.send(JSON.stringify({ method: 'ping' }));
        console.log('Sent heartbeat ping to WebSocket');
      }
    }, 30000);
  }

  // Connect to the WebSocket
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      console.log(`Connecting to WebSocket at ${WEBSOCKET_URL}`);
      this.socket = new WebSocket(WEBSOCKET_URL);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Process any pending subscriptions
        this.processPendingSubscriptions();
        
        // Only call subscribeToTrades after connection is established
        this.subscribeToTrades();
        this.setupHeartbeat();
        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Debug first few messages to see format
          if (this.reconnectAttempts < 3) {
            console.log('WebSocket message received:', data);
          }
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.error('Raw message:', event.data);
        }
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}`);
        this.isConnected = false;
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
        this.reconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  // Reconnect on disconnect
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached. Stopping reconnect attempts.`);
      return;
    }

    const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

    setTimeout(() => {
      console.log(`Reconnecting to WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Clean up old socket if it exists
      if (this.socket) {
        try {
          // Remove existing listeners to prevent memory leaks
          this.socket.onopen = null;
          this.socket.onmessage = null;
          this.socket.onclose = null;
          this.socket.onerror = null;
          
          // Close the socket if it's still open
          if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.close();
          }
        } catch (error) {
          console.error('Error cleaning up socket:', error);
        }
        this.socket = null;
      }
      
      // Reset connection state
      this.isConnected = false;
      
      // Reconnect
      this.connect().catch(error => {
        console.error('Error during reconnect:', error);
        this.reconnect(); // Try again if this attempt fails
      });
    }, delay);
  }

  private subscribeToTrades() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot subscribe: WebSocket not open');
      
      // Queue up the subscriptions for when connection is established
      this.queueTradeSubscriptions();
      return;
    }

    console.log('Subscribing to trades...');

    // Subscribe to all available coins one by one
    ALL_TRADING_PAIRS.forEach(coin => {
      const message = {
        method: 'subscribe',
        subscription: { type: 'trades', coin },
      };
      this.socket?.send(JSON.stringify(message));
      console.log(`Subscribed to trades for ${coin}`);
    });
    
    // Subscribe to user events for tracked wallets
    // Warning: subscribing to too many wallets at once might cause issues with the WebSocket
    // Implement in batches of 50 to avoid overwhelming the connection
    console.log(`Subscribing to ${TRACKED_WALLETS.length} wallet fills...`);
    
    const batchSize = 50;
    const batches = Math.ceil(TRACKED_WALLETS.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, TRACKED_WALLETS.length);
      
      setTimeout(() => {
        const batch = TRACKED_WALLETS.slice(start, end);
        console.log(`Subscribing to wallets batch ${i+1}/${batches} (${batch.length} wallets)`);
        
        batch.forEach(wallet => {
          const userFillsSubscription = {
            method: 'subscribe',
            subscription: { type: 'userFills', user: wallet },
          };
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(userFillsSubscription));
          } else {
            // Add to pending subscriptions
            this.pendingSubscriptions.push(userFillsSubscription);
          }
        });
      }, i * 1000); // Stagger the batches by 1 second each
    }
  }

  // Add these two new methods to queue and process subscriptions
  private queueTradeSubscriptions() {
    console.log('Queueing trade subscriptions for when connection is established');
    
    // Queue up subscriptions for all trading pairs
    ALL_TRADING_PAIRS.forEach(coin => {
      this.pendingSubscriptions.push({
        method: 'subscribe',
        subscription: { type: 'trades', coin },
      });
    });
    
    // Queue up wallet subscriptions
    TRACKED_WALLETS.forEach(wallet => {
      this.pendingSubscriptions.push({
        method: 'subscribe',
        subscription: { type: 'userFills', user: wallet },
      });
    });
  }

  private processPendingSubscriptions() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot process pending subscriptions: WebSocket not open');
      return;
    }
    
    console.log(`Processing ${this.pendingSubscriptions.length} pending subscriptions`);
    
    const batchSize = 50;
    const batches = Math.ceil(this.pendingSubscriptions.length / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, this.pendingSubscriptions.length);
      
      setTimeout(() => {
        const batch = this.pendingSubscriptions.slice(start, end);
        console.log(`Sending subscription batch ${i+1}/${batches} (${batch.length} subscriptions)`);
        
        batch.forEach(subscription => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(subscription));
          }
        });
        
        // If this is the last batch, clear pending subscriptions
        if (i === batches - 1) {
          this.pendingSubscriptions = [];
        }
      }, i * 1000); // Stagger the batches by 1 second each
    }
  }

  private handleMessage(data: any) {
    // Call all registered message callbacks
    this.messageCallbacks.forEach(callback => callback(data));

    // Handle subscription responses
    if (data.channel === 'subscriptionResponse') {
      console.log('Subscription confirmed:', data.data);
      return;
    }

    // Process trades data
    if (data.channel === 'trades' && Array.isArray(data.data)) {
      const trades = data.data.map((trade: any) => ({
        coin: trade.coin,
        side: trade.side,
        price: parseFloat(trade.px),
        size: parseFloat(trade.sz),
        hash: trade.hash,
        time: trade.time,
        tradeId: trade.tid,
        users: trade.users,
      }));

      // Notify all trade callbacks
      trades.forEach(trade => {
        this.tradeCallbacks.forEach(callback => callback(trade));
        
        // Check if this trade involves any of our tracked wallets
        const walletAddresses = TRACKED_WALLETS.map(addr => addr.toLowerCase());
        const tradeUsers = trade.users ? trade.users.map(addr => addr.toLowerCase()) : [];
        
        // Find if any addresses match
        const matchingWallets = walletAddresses.filter(wallet => 
          tradeUsers.includes(wallet)
        );
        
        if (matchingWallets.length > 0) {
          // This trade involves one of our tracked wallets
          const walletTrade: WalletTrade = {
            ...trade,
            walletAddress: matchingWallets[0],
          };
          
          // Notify wallet trade callbacks
          this.walletTradeCallbacks.forEach(callback => callback(walletTrade));
        }
      });
    }

    // Process user fills data
    if (data.channel === 'userFills' && data.data.fills && Array.isArray(data.data.fills)) {
      const userAddress = data.data.user.toLowerCase();
      if (TRACKED_WALLETS.map(addr => addr.toLowerCase()).includes(userAddress)) {
        data.data.fills.forEach((fill: any) => {
          const walletTrade: WalletTrade = {
            coin: fill.coin,
            side: fill.side,
            price: parseFloat(fill.px),
            size: parseFloat(fill.sz),
            hash: fill.hash,
            time: fill.time,
            tradeId: fill.tid,
            users: [userAddress],
            walletAddress: userAddress,
          };
          
          // Notify wallet trade callbacks
          this.walletTradeCallbacks.forEach(callback => callback(walletTrade));
        });
      }
    }
  }

  // Disconnect from the WebSocket
  public disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      console.log('Disconnecting from WebSocket...');
      try {
        // Remove event listeners
        this.socket.onopen = null;
        this.socket.onmessage = null;
        this.socket.onclose = null;
        this.socket.onerror = null;
        
        // Close the connection
        this.socket.close(1000, 'User initiated disconnect');
      } catch (error) {
        console.error('Error disconnecting from WebSocket:', error);
      }
      this.socket = null;
    }
    
    // Reset state
    this.isConnected = false;
    this.reconnectAttempts = 0; // Reset reconnect attempts on manual disconnect
  }

  // Register a callback for all WebSocket messages
  public onMessage(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register a callback for trade updates
  public onTrade(callback: (trade: Trade) => void) {
    this.tradeCallbacks.push(callback);
    return () => {
      this.tradeCallbacks = this.tradeCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register a callback specifically for tracked wallet trades
  public onWalletTrade(callback: (trade: WalletTrade) => void) {
    this.walletTradeCallbacks.push(callback);
    return () => {
      this.walletTradeCallbacks = this.walletTradeCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Singleton instance
export const hyperliquidAPI = new HyperliquidWebSocketAPI(); 