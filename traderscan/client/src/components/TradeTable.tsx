import React, { useState, useEffect } from 'react';
import { TradeTableProps } from '../types/trades';

const TradeTable: React.FC<TradeTableProps> = ({ trades, title = 'Recent Transactions', loading = false }) => {
  const [transactionCount, setTransactionCount] = useState(0);

  // Format timestamp relative to current time (e.g., "62 milliseconds ago")
  const formatTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const secondsAgo = now - timestamp;
    
    if (secondsAgo < 1) {
      return `${Math.floor(secondsAgo * 1000)} milliseconds ago`;
    }
    if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`;
    }
    if (secondsAgo < 3600) {
      return `${Math.floor(secondsAgo / 60)} minutes ago`;
    }
    if (secondsAgo < 86400) {
      return `${Math.floor(secondsAgo / 3600)} hours ago`;
    }
    return `${Math.floor(secondsAgo / 86400)} days ago`;
  };

  // Simple approach: use the totalSoFar property if available, otherwise count
  useEffect(() => {
    if (trades.length > 0) {
      // Check if we have the totalSoFar property in the first block
      const firstBlock = trades[0];
      if ('totalSoFar' in firstBlock && typeof firstBlock.totalSoFar === 'number') {
        // Use the totalSoFar from the most recent block
        setTransactionCount(firstBlock.totalSoFar);
      } else {
        // Fall back to counting if totalSoFar isn't available
        let total = 0;
        trades.forEach(block => {
          total += block.transactions;
        });
        
        // Only increase, never decrease
        setTransactionCount(prevCount => Math.max(prevCount, total));
      }
    }
  }, [trades]);

  return (
    <div className="w-full overflow-hidden rounded-lg bg-gray-900 shadow-md">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="font-semibold text-lg text-white">{title}</div>
        <div className="text-sm text-gray-400">
          Total Transactions: <span className="font-semibold text-blue-400">{transactionCount.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Block</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Hash</th>
              <th className="px-6 py-3 text-right">Transactions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : trades.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No transactions found
                </td>
              </tr>
            ) : (
              trades.map((block, index) => (
                <tr key={index} className={`hover:bg-gray-800 ${index === 0 ? 'bg-gray-800 bg-opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-400">
                    <a href={`#${block.blockNumber}`} className="hover:underline">
                      {block.blockNumber}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatTimeAgo(block.timestamp)}
                  </td>
                  <td className="px-6 py-4 font-mono text-blue-400 truncate max-w-xs">
                    <a href={`#${block.hash}`} className="hover:underline">
                      {block.hash}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {block.transactions}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-gray-800 text-xs text-gray-400">
        Real-time data from Hyperliquid WebSocket API
      </div>
    </div>
  );
};

export default TradeTable; 