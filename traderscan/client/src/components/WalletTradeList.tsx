import React from 'react';
import { WalletTradeProps } from '../types/trades';

const WalletTradeList: React.FC<WalletTradeProps> = ({ 
  walletTrades, 
  title = 'Tracked Wallet Trades', 
  loading = false 
}) => {
  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Truncate wallet address for display
  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="w-full overflow-hidden rounded-lg bg-gray-900 shadow-md">
      <div className="px-6 py-4 font-semibold text-lg text-white">
        {title}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Wallet</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Coin</th>
              <th className="px-6 py-3">Side</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-right">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900 text-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : walletTrades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  No wallet trades found
                </td>
              </tr>
            ) : (
              walletTrades.map((trade, index) => (
                <tr key={index} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-blue-400">
                    <a 
                      href={`https://hyperliquid.xyz/account/${trade.walletAddress}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {truncateAddress(trade.walletAddress)}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatTime(trade.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trade.coin}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${trade.side === 'B' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.side === 'B' ? 'BUY' : 'SELL'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {trade.size.toFixed(4)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletTradeList; 