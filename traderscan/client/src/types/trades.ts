export interface Trade {
  coin: string;
  side: string;
  price: number;
  size: number;
  hash: string;
  time: number;
  tradeId: number;
  users: string[];
}

export interface WalletTrade extends Trade {
  walletAddress: string;
}

export interface TradeBlock {
  blockNumber: number;
  timestamp: number;
  hash: string;
  transactions: number;
}

export interface TradeTableProps {
  trades: TradeBlock[];
  title?: string;
  loading?: boolean;
}

export interface WalletTradeProps {
  walletTrades: WalletTrade[];
  title?: string;
  loading?: boolean;
} 