"use client";

import React from 'react';
// Use the Squares component installed by jsrepo with relative path
import Squares from '../Backgrounds/Squares/Squares';

interface BackgroundSquaresProps {
  children: React.ReactNode;
}

export const BackgroundSquares: React.FC<BackgroundSquaresProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fixed background container */}
      <div className="fixed inset-0 -z-10 w-full h-full pointer-events-auto">
        <Squares
          speed={0.15}
          squareSize={50}
          direction="diagonal"
          borderColor="rgba(40, 40, 40, 0.7)" 
          hoverFillColor="rgba(35, 35, 35, 0.6)"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-0 pointer-events-none">
        <div className="pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
}; 