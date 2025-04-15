import { Position, Trader, SentimentAnalysis, PopularAsset, TraderAnalytics } from '../types';

/**
 * Analyzes the sentiment of traders based on their positions
 */
export const analyzeSentiment = (traders: Trader[]): SentimentAnalysis => {
  // Count bullish (long) and bearish (short) positions
  let bullishCount = 0;
  let bearishCount = 0;
  
  // Track position counts by coin
  const longsByCoins: Record<string, { count: number, totalLeverage: number }> = {};
  const shortsByCoins: Record<string, { count: number, totalLeverage: number }> = {};
  
  // Count how many positions have invalid data
  let invalidPositionsCount = 0;
  
  // Process all positions
  traders.forEach(trader => {
    trader.positions.forEach(position => {
      // Skip positions with null or undefined critical values
      if (position.entryPx === null || position.size === null || position.leverage === null) {
        invalidPositionsCount++;
        return;
      }
      
      if (position.isLong) {
        bullishCount++;
        
        // Track longs by coin
        if (!longsByCoins[position.coin]) {
          longsByCoins[position.coin] = { count: 0, totalLeverage: 0 };
        }
        longsByCoins[position.coin].count++;
        longsByCoins[position.coin].totalLeverage += position.leverage;
      } else {
        bearishCount++;
        
        // Track shorts by coin
        if (!shortsByCoins[position.coin]) {
          shortsByCoins[position.coin] = { count: 0, totalLeverage: 0 };
        }
        shortsByCoins[position.coin].count++;
        shortsByCoins[position.coin].totalLeverage += position.leverage;
      }
    });
  });
  
  console.log(`Total valid positions: ${bullishCount + bearishCount}, Invalid positions: ${invalidPositionsCount}`);
  
  // Calculate percentages
  const totalPositions = bullishCount + bearishCount;
  const bullishPercentage = totalPositions > 0 ? (bullishCount / totalPositions) * 100 : 0;
  const bearishPercentage = totalPositions > 0 ? (bearishCount / totalPositions) * 100 : 0;
  
  // Determine overall sentiment
  let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (bullishPercentage > bearishPercentage + 5) {
    overallSentiment = 'bullish';
  } else if (bearishPercentage > bullishPercentage + 5) {
    overallSentiment = 'bearish';
  }
  
  // Get top 10 longs by count
  const topLongs = Object.entries(longsByCoins)
    .map(([coin, { count, totalLeverage }]) => ({
      coin,
      count,
      avgLeverage: count > 0 ? totalLeverage / count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Get top 10 shorts by count
  const topShorts = Object.entries(shortsByCoins)
    .map(([coin, { count, totalLeverage }]) => ({
      coin,
      count,
      avgLeverage: count > 0 ? totalLeverage / count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    bullishCount,
    bearishCount,
    bullishPercentage,
    bearishPercentage,
    topLongs,
    topShorts,
    overallSentiment
  };
};

/**
 * Analyzes popular assets among traders
 */
export const analyzePopularAssets = (traders: Trader[]): PopularAsset[] => {
  const assetStats: Record<string, PopularAsset> = {};
  let invalidPositionsCount = 0;
  
  // Process all positions to gather asset stats
  traders.forEach(trader => {
    trader.positions.forEach(position => {
      const { coin, isLong, leverage, positionValue } = position;
      
      // Skip positions with null or undefined critical values
      if (leverage === null || positionValue === null) {
        invalidPositionsCount++;
        return;
      }
      
      if (!assetStats[coin]) {
        assetStats[coin] = {
          coin,
          longCount: 0,
          shortCount: 0,
          totalPositions: 0,
          averageLongLeverage: 0,
          averageShortLeverage: 0,
          totalPositionValue: 0,
          sentiment: 0
        };
      }
      
      // Update stats based on position
      if (isLong) {
        assetStats[coin].longCount++;
        assetStats[coin].averageLongLeverage += leverage;
      } else {
        assetStats[coin].shortCount++;
        assetStats[coin].averageShortLeverage += leverage;
      }
      
      assetStats[coin].totalPositions++;
      assetStats[coin].totalPositionValue += positionValue;
    });
  });
  
  console.log(`Popular assets: ${Object.keys(assetStats).length}, Invalid positions: ${invalidPositionsCount}`);
  
  // Calculate averages and sentiment
  Object.values(assetStats).forEach(asset => {
    if (asset.longCount > 0) {
      asset.averageLongLeverage /= asset.longCount;
    }
    
    if (asset.shortCount > 0) {
      asset.averageShortLeverage /= asset.shortCount;
    }
    
    // Calculate sentiment from -1 (all short) to 1 (all long)
    asset.sentiment = asset.totalPositions > 0 
      ? (asset.longCount - asset.shortCount) / asset.totalPositions 
      : 0;
  });
  
  // Sort by total positions, descending
  return Object.values(assetStats)
    .sort((a, b) => b.totalPositions - a.totalPositions);
};

/**
 * Generates comprehensive analytics from trader data
 */
export const generateAnalytics = (traders: Trader[]): TraderAnalytics => {
  const sentiment = analyzeSentiment(traders);
  const popularAssets = analyzePopularAssets(traders);
  
  // Count total positions
  const totalPositions = traders.reduce((sum, trader) => sum + trader.positions.length, 0);
  
  return {
    timestamp: new Date().toISOString(),
    totalTraders: traders.length,
    totalPositions,
    sentiment,
    popularAssets
  };
};

export default {
  analyzeSentiment,
  analyzePopularAssets,
  generateAnalytics
}; 