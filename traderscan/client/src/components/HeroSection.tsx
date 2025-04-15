'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SplitText } from './SplitText';

const HeroSection = () => {
  return (
    <section className="pt-28 pb-20 lg:min-h-[80vh] flex flex-col justify-center">
      <div className="max-w-5xl mx-auto text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full text-purple-200 bg-purple-900/30 border border-purple-700/20">
            Algorithmic Trading Reimagined
          </span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          <SplitText>TraderScan Quant Bot</SplitText>
        </h1>

        <motion.p 
          className="text-lg md:text-xl mb-10 text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Advanced algorithmic trading platform powered by AI and quantitative analysis.
          Optimize your crypto trading with real-time insights and automated strategies.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/dashboard" className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium transition-transform hover:scale-105">
            Launch Trading Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href="/learn" className="inline-flex items-center px-6 py-3 rounded-lg bg-gray-800 text-white font-medium border border-gray-700 hover:bg-gray-700 transition-colors">
            Learn How It Works
          </Link>
        </motion.div>

        <motion.div
          className="relative h-16 overflow-hidden rounded-xl bg-gray-900 border border-gray-800 max-w-3xl mx-auto flex items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="absolute -left-4 h-32 w-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -right-4 h-32 w-32 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-3xl opacity-20"></div>
          
          <div className="flex items-center space-x-6 animate-scroll whitespace-nowrap px-4">
            {[
              { name: 'BTC', change: '+2.4%', color: 'text-green-500' },
              { name: 'ETH', change: '+1.8%', color: 'text-green-500' },
              { name: 'SOL', change: '+4.2%', color: 'text-green-500' },
              { name: 'AVAX', change: '-0.7%', color: 'text-red-500' },
              { name: 'BNB', change: '+0.3%', color: 'text-green-500' },
              { name: 'MATIC', change: '-1.2%', color: 'text-red-500' },
              { name: 'DOGE', change: '+7.1%', color: 'text-green-500' },
            ].map((coin, index) => (
              <div key={index} className="flex items-center">
                <span className="font-medium">{coin.name}</span>
                <span className={`ml-1 ${coin.color}`}>{coin.change}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection; 