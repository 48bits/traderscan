"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SentimentGaugeProps {
  bullishPercentage: number;
  bearishPercentage: number;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  className?: string;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({
  bullishPercentage,
  bearishPercentage,
  overallSentiment,
  className = ''
}) => {
  // Determine colors based on sentiment
  const getBullishColor = () => {
    if (overallSentiment === 'bullish') return 'bg-green-600';
    return 'bg-green-500/70';
  };
  
  const getBearishColor = () => {
    if (overallSentiment === 'bearish') return 'bg-red-600';
    return 'bg-red-500/70';
  };
  
  const getSentimentText = () => {
    switch(overallSentiment) {
      case 'bullish':
        return 'Bullish';
      case 'bearish':
        return 'Bearish';
      default:
        return 'Neutral';
    }
  };
  
  const getSentimentColor = () => {
    switch(overallSentiment) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between mb-1">
        <span className="text-green-400 font-semibold">Bulls: {bullishPercentage.toFixed(1)}%</span>
        <span className={`font-bold ${getSentimentColor()}`}>{getSentimentText()}</span>
        <span className="text-red-400 font-semibold">Bears: {bearishPercentage.toFixed(1)}%</span>
      </div>
      
      <div className="w-full h-6 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="h-full flex"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div 
            className={`h-full ${getBullishColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${bullishPercentage}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          />
          <motion.div 
            className={`h-full ${getBearishColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${bearishPercentage}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          />
        </motion.div>
      </div>
    </div>
  );
}; 