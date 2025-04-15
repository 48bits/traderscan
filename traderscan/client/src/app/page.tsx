'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { ArrowRightIcon, ChartBarIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

// Sample data for mini charts
const sampleChartData = [
  { value: 40 }, { value: 30 }, { value: 60 }, { value: 50 }, 
  { value: 70 }, { value: 65 }, { value: 75 }, { value: 85 },
  { value: 80 }, { value: 90 }, { value: 100 }, { value: 110 },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Client-side only render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render with server data to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full px-4 py-20 md:py-32 flex flex-col items-center">
        <motion.div 
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.span 
            className="inline-block px-3 py-1 mb-6 text-sm bg-blue-900/30 text-blue-400 rounded-full"
            variants={fadeIn}
          >
            Hyperliquid Analytics Platform
          </motion.span>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300 leading-snug md:leading-snug pb-1"
            variants={fadeIn}
          >
            See What Top Traders <br/> Are Doing Right Now
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            variants={fadeIn}
          >
            Gain an edge with real-time sentiment analysis, track the moves of top traders, 
            and understand market trends before they happen.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeIn}
          >
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              Get Started <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link 
              href="/traderscan" 
              className="px-8 py-4 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Explore TraderScan
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Stats Bar */}
      <motion.section 
        className="w-full bg-gradient-to-r from-blue-900/20 to-purple-900/20 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-blue-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              500+
            </motion.div>
            <div className="text-sm text-gray-400">Top Traders Tracked</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-blue-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              24/7
            </motion.div>
            <div className="text-sm text-gray-400">Real-time Updates</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-blue-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              $100M+
            </motion.div>
            <div className="text-sm text-gray-400">Volume Analyzed</div>
          </div>
          <div className="text-center">
            <motion.div 
              className="text-3xl font-bold text-blue-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              98%
            </motion.div>
            <div className="text-sm text-gray-400">Data Accuracy</div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="w-full px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced tools to give you an edge in the Hyperliquid market
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <SparklesIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Sentiment</h3>
              <p className="text-gray-300 mb-6">
                Track market sentiment live with our advanced AI analysis of trader behavior
              </p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleChartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Whale Tracking</h3>
              <p className="text-gray-300 mb-6">
                Monitor the top 500 traders on Hyperliquid and their position changes in real-time
              </p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleChartData.slice().reverse()}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
              <p className="text-gray-300 mb-6">
                Comprehensive data visualization and trend analysis to inform your trading decisions
              </p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...sampleChartData.slice(0, 6), ...sampleChartData.slice(0, 6).reverse()]}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits/Value Proposition Section */}
      <motion.section 
        className="w-full px-4 py-20 bg-gradient-to-b from-transparent to-blue-950/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <motion.div 
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Gain Your Edge in the Market</h2>
              <p className="text-xl text-gray-300 mb-8">
                Don't just follow the market - understand it. Our platform gives you insights that most traders don't have access to.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-4 bg-blue-900/30 rounded-full p-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span>See what successful traders are buying and selling</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 bg-blue-900/30 rounded-full p-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span>Identify market trends before they become obvious</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 bg-blue-900/30 rounded-full p-1">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span>Make data-driven decisions with confidence</span>
                </li>
              </ul>
              <div className="mt-10">
                <Link 
                  href="/dashboard" 
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  Explore Dashboard <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="rounded-xl overflow-hidden relative h-96 md:h-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                <div className="w-full max-w-sm p-6 backdrop-blur-sm bg-black/50 rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-8">
                    <div className="text-xl font-semibold">Market Sentiment</div>
                    <div className="text-2xl font-bold text-green-400">78%</div>
                  </div>
                  <div className="mb-8">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "78%" }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        viewport={{ once: true }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">Long Positions</div>
                      <div className="text-xl font-semibold text-green-400">68%</div>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="text-sm text-gray-400">Short Positions</div>
                      <div className="text-xl font-semibold text-red-400">32%</div>
                    </div>
                  </div>
                  <div>
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={sampleChartData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <section className="w-full px-4 py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Gain Your Trading Edge?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join the community of traders using data-driven insights to make better decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard" 
              className="px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Get Started Now
            </Link>
            <Link 
              href="/traderscan" 
              className="px-10 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
