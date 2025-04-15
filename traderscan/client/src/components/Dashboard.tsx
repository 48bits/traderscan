"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SplitText } from './SplitText';
import { SentimentGauge } from './SentimentGauge';
import { PopularAssets } from './PopularAssets';
import { TopTraders } from './TopTraders';
import { LoadingBar } from './LoadingBar';
import { LargestPositions } from './LargestPositions';
import { useTraderData } from '../hooks/useTraderData';

export const Dashboard: React.FC = () => {
  const { 
    traders, 
    analytics, 
    isLoading, 
    isRefreshing, 
    loadingProgress,
    error, 
    lastUpdated,
    refreshData
  } = useTraderData(true);

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(new Date(lastUpdated));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Loading bar at the top of the page */}
      <LoadingBar 
        isLoading={isLoading} 
        isRefreshing={isRefreshing} 
        progress={loadingProgress}
      />
      
      <header className="mb-10 text-center">
        <SplitText 
          text="HyperLiquid Trader Sentiment" 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 text-white"
          splitBy="words"
          tag="h1"
        />
        <SplitText 
          text="Real-time analysis of crypto trader positions and sentiment"
          className="text-xl text-gray-300"
          delay={0.5}
          splitBy="words"
          tag="p"
        />
      </header>

      {/* Status and control bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-4 bg-gray-900/70 backdrop-blur-sm rounded-xl border border-gray-800">
        <div className="text-sm md:text-base">
          {isLoading ? (
            <span className="text-blue-400">
              Loading data... {loadingProgress > 0 ? `(${Math.round(loadingProgress)}%)` : ''}
            </span>
          ) : isRefreshing ? (
            <span className="text-blue-400">
              Refreshing data... {loadingProgress > 0 ? `(${Math.round(loadingProgress)}%)` : ''}
            </span>
          ) : error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <span>
              Last updated: <span className="font-semibold">{formatLastUpdated()}</span>
            </span>
          )}
        </div>
        
        <div className="mt-3 md:mt-0">
          <button
            onClick={() => refreshData()}
            disabled={isLoading || isRefreshing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-lg text-gray-300">
            Loading trader data... {loadingProgress > 0 ? `(${Math.round(loadingProgress)}%)` : ''}
          </p>
        </div>
      ) : analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sentiment section */}
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Market Sentiment</h2>
            {analytics.sentiment && (
              <>
                <SentimentGauge 
                  bullishPercentage={analytics.sentiment.bullishPercentage}
                  bearishPercentage={analytics.sentiment.bearishPercentage}
                  overallSentiment={analytics.sentiment.overallSentiment}
                  className="mb-6"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-400">Top Long Assets</h3>
                    <div className="space-y-2">
                      {analytics.sentiment.topLongs.slice(0, 5).map((item) => (
                        <div key={item.coin} className="flex justify-between items-center">
                          <span className="font-medium">{item.coin}</span>
                          <span className="text-sm">
                            {item.count} positions @ {item.avgLeverage.toFixed(1)}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-400">Top Short Assets</h3>
                    <div className="space-y-2">
                      {analytics.sentiment.topShorts.slice(0, 5).map((item) => (
                        <div key={item.coin} className="flex justify-between items-center">
                          <span className="font-medium">{item.coin}</span>
                          <span className="text-sm">
                            {item.count} positions @ {item.avgLeverage.toFixed(1)}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
          
          {/* Popular assets section */}
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold mb-4">Popular Assets</h2>
            {analytics.popularAssets && (
              <PopularAssets assets={analytics.popularAssets} />
            )}
          </motion.div>
          
          {/* Top traders section */}
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg md:col-span-2 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-4">Top Traders</h2>
            {traders && traders.length > 0 ? (
              <TopTraders traders={traders} />
            ) : (
              <p className="text-gray-500">No trader data available.</p>
            )}
          </motion.div>
          
          {/* Largest Positions section */}
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg md:col-span-2 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold mb-4">Largest Open Positions</h2>
            {traders && traders.length > 0 ? (
              <LargestPositions traders={traders} limit={150} />
            ) : (
              <p className="text-gray-500">No position data available.</p>
            )}
          </motion.div>
          
          {/* Stats section */}
          <motion.div 
            className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-lg md:col-span-2 border border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-4">Market Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
                <h3 className="text-lg font-semibold text-blue-400">Total Traders</h3>
                <p className="text-3xl font-bold">{analytics.totalTraders}</p>
              </div>
              
              <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-800/50">
                <h3 className="text-lg font-semibold text-purple-400">Total Positions</h3>
                <p className="text-3xl font-bold">{analytics.totalPositions}</p>
              </div>
              
              <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-800/50">
                <h3 className="text-lg font-semibold text-amber-400">Bull/Bear Ratio</h3>
                <p className="text-3xl font-bold">
                  {analytics.sentiment.bearishCount > 0 
                    ? (analytics.sentiment.bullishCount / analytics.sentiment.bearishCount).toFixed(2)
                    : '∞'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="text-center py-10 bg-red-900/30 backdrop-blur-sm rounded-xl border border-red-800/50">
          <p className="text-red-400 text-lg">Failed to load data. Please try refreshing.</p>
        </div>
      )}
    </div>
  );
}; 