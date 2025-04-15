import React, { useState, useEffect } from 'react';
import { useTraderPositions, WalletPosition } from '../hooks/useTraderPositions';

interface TrackedWalletsProps {
  wallets: string[];
  title?: string;
}

const TrackedWallets: React.FC<TrackedWalletsProps> = ({ 
  wallets, 
  title = 'Tracked Wallets' 
}) => {
  const { walletPositions, loading } = useTraderPositions();
  const [sortedWallets, setSortedWallets] = useState<WalletPosition[]>([]);
  
  // When walletPositions or wallets change, update the sorted list
  useEffect(() => {
    if (walletPositions.length === 0) {
      // If we don't have position data yet, create entries with 0 positions
      const walletsWithZeroPositions = wallets.map(address => ({
        address: address.toLowerCase(),
        positionCount: 0
      }));
      setSortedWallets(walletsWithZeroPositions);
      return;
    }
    
    // Create a map of all tracked wallets for quick lookup
    const trackedWalletsSet = new Set(wallets.map(w => w.toLowerCase()));
    
    // Filter wallet positions to only include tracked wallets
    const trackedPositions = walletPositions.filter(wp => 
      trackedWalletsSet.has(wp.address.toLowerCase())
    );
    
    // Find wallets that are tracked but don't have position data
    const walletsWithoutPositions = wallets
      .filter(address => !walletPositions.some(wp => 
        wp.address.toLowerCase() === address.toLowerCase()
      ))
      .map(address => ({
        address: address.toLowerCase(),
        positionCount: 0 // Default to 0 positions if we don't have data
      }));
    
    // Combine and sort by position count
    const combined = [...trackedPositions, ...walletsWithoutPositions]
      .sort((a, b) => b.positionCount - a.positionCount);
    
    setSortedWallets(combined);
  }, [wallets, walletPositions]);

  // Truncate wallet address for display
  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="w-full overflow-hidden rounded-lg bg-gray-900 shadow-md">
      <div className="px-6 py-4 font-semibold text-lg text-white">
        {title} ({wallets.length})
      </div>
      
      <div className="overflow-x-auto">
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedWallets.length === 0 ? (
            <div className="text-gray-400">
              {loading ? 'Loading wallet data...' : 'No wallets being tracked'}
            </div>
          ) : (
            sortedWallets.map((wallet) => (
              <div key={wallet.address} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <a 
                  href={`https://hyperliquid.xyz/account/${wallet.address}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {truncateAddress(wallet.address)}
                </a>
                <span className={`text-xs ${wallet.positionCount > 0 ? 'text-green-500 font-bold' : 'text-gray-500'}`}>
                  {wallet.positionCount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-800 text-xs text-gray-400">
        Numbers indicate transactions captured in real-time since page load
      </div>
    </div>
  );
};

export default TrackedWallets; 