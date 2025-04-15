import { useState, useEffect, useRef } from 'react';
import { useHyperliquidTrades } from './useHyperliquidTrades';
import { TRACKED_WALLETS } from '../utils/api';

export interface WalletPosition {
  address: string;
  positionCount: number;
}

export function useTraderPositions() {
  const { walletTrades } = useHyperliquidTrades();
  const [walletPositions, setWalletPositions] = useState<WalletPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to keep track of wallet transaction counts
  const transactionCounts = useRef<Record<string, number>>({});

  // Process wallet trades to count transactions per wallet
  useEffect(() => {
    // Initialize wallet counts if empty
    if (Object.keys(transactionCounts.current).length === 0) {
      TRACKED_WALLETS.forEach(wallet => {
        transactionCounts.current[wallet.toLowerCase()] = 0;
      });
    }
    
    // Count the most recent trade that we haven't processed yet
    if (walletTrades.length > 0) {
      const trade = walletTrades[0];
      if (trade && trade.walletAddress) {
        const walletAddress = trade.walletAddress.toLowerCase();
        // Increment the transaction count for this wallet
        transactionCounts.current[walletAddress] = 
          (transactionCounts.current[walletAddress] || 0) + 1;
        
        // Update wallet positions with the new counts
        updateWalletPositions();
      }
    }
  }, [walletTrades]);

  // Initial load to set up counts for all tracked wallets
  useEffect(() => {
    // Initialize with zero counts for all wallets
    const initialCounts: Record<string, number> = {};
    TRACKED_WALLETS.forEach(wallet => {
      initialCounts[wallet.toLowerCase()] = 0;
    });
    
    transactionCounts.current = initialCounts;
    updateWalletPositions();
    setLoading(false);
  }, []);

  // Convert transaction counts to sorted wallet positions
  const updateWalletPositions = () => {
    const positions: WalletPosition[] = Object.entries(transactionCounts.current)
      .map(([address, count]) => ({
        address: address.toLowerCase(),
        positionCount: count
      }))
      .sort((a, b) => b.positionCount - a.positionCount);
    
    setWalletPositions(positions);
  };

  return {
    walletPositions,
    loading,
    error
  };
} 