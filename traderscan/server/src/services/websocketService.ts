import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { Trade, WalletTrade } from '../types';

// Hyperliquid WebSocket API URLs
const HYPERLIQUID_WEBSOCKET_MAINNET = 'wss://api.hyperliquid.xyz/ws';
const HYPERLIQUID_WEBSOCKET_TESTNET = 'wss://api.hyperliquid-testnet.xyz/ws';

// We'll use mainnet by default
const WEBSOCKET_URL = HYPERLIQUID_WEBSOCKET_MAINNET;

// Full list of trading pairs on Hyperliquid
const ALL_TRADING_PAIRS = [
  'BTC', 'ETH', 'SOL', 'XRP', 'BNB', 'DOGE', 'ADA', 'AVAX', 'MATIC', 'LINK', 
  'DOT', 'LTC', 'ATOM', 'UNI', 'ETC', 'FIL', 'APE', 'AAVE', 'CRV', 'COMP',
  'ARB', 'OP', 'NEAR', 'APT', 'BLUR', 'BONK', 'JTO', 'PEPE', 'MEME', 'SHIB',
  'INJ', 'SUI', 'JUP', 'WIF', 'SEI', 'STRK', 'RNDR', 'FET', 'HYPE'
];

export class WebSocketService {
  private socket: WebSocket | null = null;
  private pendingSubscriptions: any[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 15;
  private reconnectDelay = 1000;
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  private setupHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ method: 'ping' }));
        console.log('Sent heartbeat ping to WebSocket');
      }
    }, 30000);
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      console.log(`Connecting to WebSocket at ${WEBSOCKET_URL}`);
      this.socket = new WebSocket(WEBSOCKET_URL);

      this.socket.on('open', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.processPendingSubscriptions();
        this.subscribeToTrades();
        this.setupHeartbeat();
        resolve();
      });

      this.socket.on('message', (data: string) => {
        try {
          const parsedData = JSON.parse(data);
          this.handleMessage(parsedData);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          console.error('Raw message:', data);
        }
      });

      this.socket.on('close', () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval);
          this.heartbeatInterval = null;
        }
        this.reconnect();
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });
    });
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Maximum reconnect attempts (${this.maxReconnectAttempts}) reached.`);
      return;
    }

    const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts));
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Error during reconnect:', error);
        this.reconnect();
      });
    }, delay);
  }

  private subscribeToTrades() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('Cannot subscribe: WebSocket not open');
      this.queueTradeSubscriptions();
      return;
    }

    console.log('Subscribing to trades...');

    ALL_TRADING_PAIRS.forEach(coin => {
      const message = {
        method: 'subscribe',
        subscription: { type: 'trades', coin },
      };
      this.socket?.send(JSON.stringify(message));
      console.log(`Subscribed to trades for ${coin}`);
    });
  }

  private queueTradeSubscriptions() {
    ALL_TRADING_PAIRS.forEach(coin => {
      this.pendingSubscriptions.push({
        method: 'subscribe',
        subscription: { type: 'trades', coin },
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
        
        if (i === batches - 1) {
          this.pendingSubscriptions = [];
        }
      }, i * 1000);
    }
  }

  private handleMessage(data: any) {
    if (data.channel === 'subscriptionResponse') {
      console.log('Subscription confirmed:', data.data);
      return;
    }

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

      // Emit trades to all listeners
      this.eventEmitter.emit('trades', trades);
    }
  }

  public disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.socket) {
      console.log('Disconnecting from WebSocket...');
      this.socket.close(1000, 'Server shutting down');
      this.socket = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  // Event listener methods
  public onTrades(callback: (trades: Trade[]) => void) {
    this.eventEmitter.on('trades', callback);
    return () => {
      this.eventEmitter.off('trades', callback);
    };
  }
}

// Create singleton instance
export const websocketService = new WebSocketService(); 