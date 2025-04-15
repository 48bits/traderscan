'use client';

import React, { useState, useEffect } from 'react';
import TradeTable from '../../components/TradeTable';
import WalletTradeList from '../../components/WalletTradeList';
import TrackedWallets from '../../components/TrackedWallets';
import WalletManager from '../../components/WalletManager';
import WebSocketErrorBanner from '../../components/WebSocketErrorBanner';
import { useHyperliquidTrades } from '../../hooks/useHyperliquidTrades';

export default function HypurrscanPage() {
  const { tradeBlocks, walletTrades, loading, trackedWallets, error, connected } = useHyperliquidTrades();
  const [mounted, setMounted] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);

  // Client-side only render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to reload the page on retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Don't render with server data to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-20">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Hypurrscan
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real-time Hyperliquid blockchain explorer tracking trades and transactions from top traders
          </p>
        </header>

        {/* Use the WebSocketErrorBanner component */}
        <WebSocketErrorBanner 
          error={error}
          loading={loading}
          connected={connected}
          onRetry={handleRetry}
        />

        <div className="grid grid-cols-1 gap-8">
          {/* Main transactions table */}
          <TradeTable 
            trades={tradeBlocks} 
            title="Recent Blocks" 
            loading={loading} 
          />
          
          {/* Wallet trades table */}
          <WalletTradeList 
            walletTrades={walletTrades} 
            title="Tracked Wallet Trades" 
            loading={loading} 
          />
          
          {/* Tracked wallets */}
          <div className="relative">
            <TrackedWallets 
              wallets={trackedWallets} 
              title="Tracked Wallets by Transaction Count" 
            />
            <div className="mt-4 flex justify-center">
              <button 
                onClick={() => setShowWalletManager(!showWalletManager)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                {showWalletManager ? 'Hide Wallet Manager' : 'Upload/Manage Wallet List'}
              </button>
            </div>
            {showWalletManager && (
              <WalletManager />
            )}
          </div>
        </div>
      </div>

      <footer className="w-full mt-16 py-6 bg-gray-900 text-center text-gray-400">
        <div className="container mx-auto px-4">
          <p>© 2025 Hypurrscan. All rights reserved.</p>
          <p className="text-sm mt-2">
            Not affiliated with Hyperliquid. Data provided for informational purposes only.
          </p>
        </div>
      </footer>
    </main>
  );
} 