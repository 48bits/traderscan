'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { label: 'Daily Trades', value: 18000, prefix: '', suffix: '+' },
  { label: 'Success Rate', value: 94, prefix: '', suffix: '%' },
  { label: 'Assets Monitored', value: 120, prefix: '', suffix: '' },
  { label: 'Return (YTD)', value: 38, prefix: '+', suffix: '%' }
];

const CountUp = ({ end, duration = 2, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const startAnimation = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      const value = Math.floor(percentage * end);
      
      setCount(value);
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(startAnimation);
      }
    };
    
    if (isInView) {
      animationFrame = requestAnimationFrame(startAnimation);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isInView]);
  
  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold">
      {prefix}{count.toLocaleString('en-US', { maximumFractionDigits: decimals })}{suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section className="py-20 relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-blue-600 rounded-full filter blur-[128px]"></div>
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-purple-600 rounded-full filter blur-[128px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            TraderScan By The Numbers
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our quantitative trading system delivers consistent performance
          </motion.p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -15px rgba(2, 12, 27, 0.7)' }}
            >
              <CountUp 
                end={stat.value} 
                prefix={stat.prefix} 
                suffix={stat.suffix} 
              />
              <p className="text-gray-400 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <a 
            href="/performance" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            View detailed performance metrics
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection; 