"use client";

import React, { useState } from 'react';
import { Position, Trader } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface LargestPositionsProps {
  traders: Trader[];
  limit?: number;
}

interface EnhancedPosition extends Position {
  shortAddress: string;
  hoursSinceOpen: number;
}

export const LargestPositions: React.FC<LargestPositionsProps> = ({ traders, limit = 150 }) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const positionsPerPage = 10;
  const maxPages = 15;
  
  // Sort state
  const [sortBy, setSortBy] = useState<'value' | 'time'>('value');
  
  // Helper to shorten blockchain addresses
  const shortenAddress = (address: string): string => {
    if (!address) return '';
    
    // Check if address already has a display name format (e.g., doesn't start with 0x)
    if (!address.startsWith('0x')) return address;
    
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Find all positions and add trader info
  const allPositions: EnhancedPosition[] = React.useMemo(() => {
    const now = Date.now();
    console.log("Current client time:", now, new Date(now).toISOString());
    
    const positions: EnhancedPosition[] = [];
    
    traders.forEach(trader => {
      trader.positions.forEach(position => {
        // Log some debug info for the first few positions
        if (positions.length < 5) {
          console.log(`Position ${position.coin} - entry time: ${position.entryTime} (${new Date(position.entryTime).toISOString()})`);
          console.log(`Time diff: ${now - position.entryTime} ms, hours: ${(now - position.entryTime) / (1000 * 60 * 60)}`);
        }
        
        // Make sure we handle the possibility that entryTime might be in the future
        const validEntryTime = position.entryTime > now ? now - (24 * 60 * 60 * 1000) : position.entryTime;
        const hoursSinceOpen = Math.max(0, Math.round((now - validEntryTime) / (1000 * 60 * 60)));
        
        // Add trader information to each position
        positions.push({
          ...position,
          shortAddress: shortenAddress(trader.address),
          hoursSinceOpen: hoursSinceOpen
        });
      });
    });
    
    // First sort all positions by value and take the top 'limit' positions
    const topPositionsByValue = [...positions].sort((a, b) => b.positionValue - a.positionValue).slice(0, limit);
    
    // Then sort by time if needed, but only among the top positions by value
    if (sortBy === 'time') {
      return topPositionsByValue.sort((a, b) => a.hoursSinceOpen - b.hoursSinceOpen);
    }
    
    return topPositionsByValue;
  }, [traders, sortBy, limit]);
  
  // Helper to format large numbers
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };
  
  // Debug: Log some top positions
  React.useEffect(() => {
    if (allPositions.length > 0) {
      console.log("Top 3 positions hours ago values:");
      allPositions.slice(0, 3).forEach((pos, idx) => {
        console.log(`${idx+1}. ${pos.coin} (${pos.isLong ? 'LONG' : 'SHORT'}) - ${pos.hoursSinceOpen} hours ago`);
      });
    }
  }, [allPositions]);
  
  // Get positions for current page
  const indexOfLastPosition = currentPage * positionsPerPage;
  const indexOfFirstPosition = indexOfLastPosition - positionsPerPage;
  const currentPositions = allPositions.slice(indexOfFirstPosition, indexOfLastPosition);
  
  // Calculate total pages based on the total positions or max pages
  const totalPages = Math.min(Math.ceil(allPositions.length / positionsPerPage), maxPages);
  
  // Page change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Handle sort change
  const handleSortChange = (type: 'value' | 'time') => {
    setSortBy(type);
    setCurrentPage(1); // Reset to first page when changing sort
  };
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-end mb-4">
        <div className="bg-gray-800 rounded-lg p-1 inline-flex space-x-1">
          <button
            onClick={() => handleSortChange('value')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              sortBy === 'value' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Largest First
          </button>
          <button
            onClick={() => handleSortChange('time')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              sortBy === 'time' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Newest First
          </button>
        </div>
      </div>
      
      <table className="w-full min-w-full table-auto">
        <thead className="bg-gray-800/50">
          <tr>
            <th className="px-4 py-2 text-left">Asset</th>
            <th className="px-4 py-2 text-left">Side</th>
            <th className="px-4 py-2 text-left">Wallet</th>
            <th className="px-4 py-2 text-right">Position Size</th>
            <th className="px-4 py-2 text-right">Leverage</th>
            <th className="px-4 py-2 text-right">
              <div 
                className={`flex items-center justify-end cursor-pointer ${sortBy === 'time' ? 'text-blue-400' : ''}`}
                onClick={() => handleSortChange('time')}
              >
                Hours Ago
                {sortBy === 'time' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          <AnimatePresence mode="wait">
            {currentPositions.map((position, index) => (
              <motion.tr 
                key={`${position.user}-${position.coin}-${position.entryTime}`} 
                className={index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <td className="px-4 py-3 font-medium">{position.coin}</td>
                <td className={`px-4 py-3 ${position.isLong ? 'text-green-400' : 'text-red-400'}`}>
                  {position.isLong ? 'LONG' : 'SHORT'}
                </td>
                <td className="px-4 py-3">{position.shortAddress}</td>
                <td className="px-4 py-3 text-right">{formatValue(position.positionValue)}</td>
                <td className="px-4 py-3 text-right">{position.leverage.toFixed(1)}x</td>
                <td className="px-4 py-3 text-right">{position.hoursSinceOpen}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
          
          {currentPositions.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                No positions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-2">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-2 py-1 rounded-lg transition-colors ${
              currentPage === 1 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
            aria-label="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                currentPage === number
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
              aria-label={`Page ${number}`}
              aria-current={currentPage === number ? 'page' : undefined}
            >
              {number}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-2 py-1 rounded-lg transition-colors ${
              currentPage === totalPages 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
            aria-label="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <div className="text-sm text-gray-400 ml-2">
            {indexOfFirstPosition + 1}-{Math.min(indexOfLastPosition, allPositions.length)} of {Math.min(allPositions.length, positionsPerPage * maxPages)}
          </div>
        </div>
      )}
    </div>
  );
}; 