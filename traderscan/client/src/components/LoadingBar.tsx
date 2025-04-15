"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingBarProps {
  isLoading: boolean;
  isRefreshing: boolean;
  progress?: number; // Optional explicit progress (0-100)
  duration?: number; // Animation duration in ms
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  isLoading, 
  isRefreshing, 
  progress, 
  duration = 2000 
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  
  // If no explicit progress is provided, simulate loading progress
  useEffect(() => {
    if ((isLoading || isRefreshing) && progress === undefined) {
      // Reset progress when starting
      setInternalProgress(0);
      
      // Quick initial progress to 70%
      const initialTimer = setTimeout(() => {
        setInternalProgress(70);
      }, 300);
      
      // Slower progress to 90%
      const secondTimer = setTimeout(() => {
        setInternalProgress(90);
      }, duration / 2);
      
      return () => {
        clearTimeout(initialTimer);
        clearTimeout(secondTimer);
      };
    } else if (!isLoading && !isRefreshing) {
      // Complete the loading animation when finished
      setInternalProgress(100);
      
      // Reset after animation completes
      const resetTimer = setTimeout(() => {
        setInternalProgress(0);
      }, 500); // Give time for completion animation
      
      return () => {
        clearTimeout(resetTimer);
      };
    }
  }, [isLoading, isRefreshing, duration, progress]);
  
  // Use provided progress if available, otherwise use internal progress
  const currentProgress = progress !== undefined ? progress : internalProgress;
  
  // Don't render if not loading/refreshing and progress is 0
  if (!isLoading && !isRefreshing && currentProgress === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 w-full z-50 h-1">
      <motion.div
        className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 h-full"
        initial={{ width: "0%" }}
        animate={{ 
          width: `${currentProgress}%`,
          opacity: currentProgress === 100 ? 0 : 1
        }}
        transition={{ 
          width: { 
            duration: currentProgress === 100 ? 0.3 : 0.8,
            ease: "easeInOut" 
          },
          opacity: { 
            duration: 0.3, 
            delay: currentProgress === 100 ? 0.3 : 0 
          }
        }}
      />
    </div>
  );
}; 