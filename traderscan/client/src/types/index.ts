// HyperLiquid API types
export interface Perpetual {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  baseCurrency?: string;
  quoteCurrency?: string;
  defaultLeverage?: number;
  initialMarginFraction?: number;
  maintenanceMarginFraction?: number;
  priceIncrement?: number;
  sizeIncrement?: number;
  minSize?: number;
  openInterest?: string;
  isPermissionless?: boolean;
  assetPermissionless?: number;
  onlyIsolated?: boolean;
  isDelisted?: boolean;
}

export interface Position {
  coin: string;
  entryPx: number;
  entryTime: number;
  size: number;
  leverage: number;
  liquidationPx: number;
  marginUsed: number;
  isLong: boolean;
  user: string;
  positionValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
}

export interface Trader {
  address: string;
  positions: Position[];
  lastUpdated: string; // ISO date string
}

// Analytics types
export interface SentimentAnalysis {
  bullishCount: number;
  bearishCount: number;
  bullishPercentage: number;
  bearishPercentage: number;
  topLongs: {coin: string, count: number, avgLeverage: number}[];
  topShorts: {coin: string, count: number, avgLeverage: number}[];
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface PopularAsset {
  coin: string;
  longCount: number;
  shortCount: number;
  totalPositions: number;
  averageLongLeverage: number;
  averageShortLeverage: number;
  totalPositionValue: number;
  sentiment: number; // Range from -1 (all short) to 1 (all long)
}

export interface TraderAnalytics {
  timestamp: string; // ISO date string
  totalTraders: number;
  totalPositions: number;
  sentiment: SentimentAnalysis;
  popularAssets: PopularAsset[];
}

export interface ApiResponse {
  traders?: Trader[];
  analytics: TraderAnalytics;
  fromCache: boolean;
  cacheAge?: number;
} 