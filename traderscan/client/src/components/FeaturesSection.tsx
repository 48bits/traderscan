'use client';

import { motion } from 'framer-motion';
import { ChartBarIcon, CloudIcon, LightBulbIcon, CpuChipIcon, ArrowTrendingUpIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Advanced Algorithms',
    description: 'Proprietary trading algorithms optimized for various market conditions and asset classes.',
    icon: <CpuChipIcon className="w-12 h-12" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Real-time Analytics',
    description: 'Process market data in milliseconds to identify profitable trading opportunities.',
    icon: <ChartBarIcon className="w-12 h-12" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'AI Predictions',
    description: 'Machine learning models that adapt to changing market conditions and predict trends.',
    icon: <LightBulbIcon className="w-12 h-12" />,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    title: 'Cloud Infrastructure',
    description: 'Deployed on high-performance cloud infrastructure for minimal latency and maximum uptime.',
    icon: <CloudIcon className="w-12 h-12" />,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Risk Management',
    description: 'Sophisticated risk management to protect your capital during volatile market conditions.',
    icon: <LockClosedIcon className="w-12 h-12" />,
    color: 'from-red-500 to-red-600'
  },
  {
    title: 'Performance Tracking',
    description: 'Detailed performance metrics and historical analysis of all trading activities.',
    icon: <ArrowTrendingUpIcon className="w-12 h-12" />,
    color: 'from-green-500 to-green-600'
  }
];

const FeatureCard = ({ feature, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all"
    >
      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} mb-6 flex items-center justify-center text-white`}>
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
      <p className="text-gray-400">{feature.description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powerful Trading Features
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our quant trading bot combines cutting-edge technology with financial expertise
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 