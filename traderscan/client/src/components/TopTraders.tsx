"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Trader } from '../types';

interface TopTradersProps {
  traders: Trader[];
  className?: string;
}

export const TopTraders: React.FC<TopTradersProps> = ({
  traders,
  className = ''
}) => {
  // Sort traders by total position value
  const sortedTraders = [...traders].sort((a, b) => {
    const aValue = a.positions.reduce((sum, pos) => sum + pos.positionValue, 0);
    const bValue = b.positions.reduce((sum, pos) => sum + pos.positionValue, 0);
    return bValue - aValue;
  });
  
  // Take top 10
  const topTraders = sortedTraders.slice(0, 10);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-5 gap-2 font-semibold mb-2 text-sm md:text-base">
        <div className="col-span-2">Address</div>
        <div className="col-span-1 text-center">Positions</div>
        <div className="col-span-1 text-center">Total Value</div>
        <div className="col-span-1 text-center">Top Asset</div>
      </div>
      
      {topTraders.map((trader, index) => {
        // Calculate total position value
        const totalValue = trader.positions.reduce((sum, pos) => sum + pos.positionValue, 0);
        
        // Find top asset by position value
        const topAsset = trader.positions.reduce((top, pos) => {
          return top.positionValue > pos.positionValue ? top : pos;
        }, trader.positions[0]);
        
        // Format address for display
        const shortAddress = `${trader.address.slice(0, 6)}...${trader.address.slice(-4)}`;
        
        return (
          <motion.div
            key={trader.address}
            className="grid grid-cols-5 gap-2 py-2 border-b last:border-b-0 text-sm md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="col-span-2 font-mono text-xs md:text-sm truncate" title={trader.address}>{shortAddress}</div>
            <div className="col-span-1 text-center">{trader.positions.length}</div>
            <div className="col-span-1 text-center">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="col-span-1 text-center">
              <span className={topAsset.isLong ? 'text-green-500' : 'text-red-500'}>
                {topAsset.coin} {topAsset.isLong ? 'LONG' : 'SHORT'}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 