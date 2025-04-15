"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PopularAsset } from '../types';

interface PopularAssetsProps {
  assets: PopularAsset[];
  className?: string;
}

export const PopularAssets: React.FC<PopularAssetsProps> = ({
  assets,
  className = ''
}) => {
  // Take top 5 by total positions
  const topAssets = assets.slice(0, 5);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-6 gap-2 font-semibold mb-2 text-sm md:text-base">
        <div className="col-span-1">Coin</div>
        <div className="col-span-1 text-center">Positions</div>
        <div className="col-span-1 text-center text-green-500">Longs</div>
        <div className="col-span-1 text-center text-red-500">Shorts</div>
        <div className="col-span-1 text-center">Leverage</div>
        <div className="col-span-1 text-center">Sentiment</div>
      </div>
      
      {topAssets.map((asset, index) => (
        <motion.div
          key={asset.coin}
          className="grid grid-cols-6 gap-2 py-2 border-b last:border-b-0 text-sm md:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="col-span-1 font-bold">{asset.coin}</div>
          <div className="col-span-1 text-center">{asset.totalPositions}</div>
          <div className="col-span-1 text-center text-green-500">{asset.longCount}</div>
          <div className="col-span-1 text-center text-red-500">{asset.shortCount}</div>
          <div className="col-span-1 text-center">
            {asset.longCount > 0 ? asset.averageLongLeverage.toFixed(1) : '-'}x / 
            {asset.shortCount > 0 ? asset.averageShortLeverage.toFixed(1) : '-'}x
          </div>
          <div className="col-span-1 text-center">
            <SentimentBar value={asset.sentiment} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface SentimentBarProps {
  value: number; // -1 to 1
}

const SentimentBar: React.FC<SentimentBarProps> = ({ value }) => {
  // Transform -1 to 1 range into 0-100% for display
  const bullishPercent = ((value + 1) / 2) * 100;
  const bearishPercent = 100 - bullishPercent;
  
  // Determine color based on sentiment
  const getColor = () => {
    if (value > 0.3) return 'bg-green-500';
    if (value < -0.3) return 'bg-red-500';
    return 'bg-yellow-500';
  };
  
  return (
    <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className={`h-full ${getColor()}`}
        style={{ width: `${bullishPercent}%` }}
      />
    </div>
  );
}; 