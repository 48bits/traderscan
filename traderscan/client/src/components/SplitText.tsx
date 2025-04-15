"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  tag?: keyof JSX.IntrinsicElements;
  lineClassName?: string;
  wordClassName?: string;
  charClassName?: string;
  splitBy?: 'chars' | 'words' | 'lines';
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.03,
  tag = 'div',
  lineClassName = '',
  wordClassName = '',
  charClassName = '',
  splitBy = 'chars'
}) => {
  // Handle empty text
  if (!text) return null;

  // Animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delay
      }
    }
  };

  const childVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  let content;

  if (splitBy === 'chars') {
    // Split by characters
    content = text.split('').map((char, index) => (
      <motion.span
        key={`char-${index}`}
        className={charClassName}
        variants={childVariants}
        style={{ display: 'inline-block' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ));
  } else if (splitBy === 'words') {
    // Split by words
    content = text.split(' ').map((word, index) => (
      <motion.span
        key={`word-${index}`}
        className={wordClassName}
        variants={childVariants}
        style={{ display: 'inline-block', marginRight: '0.25em' }}
      >
        {word}
      </motion.span>
    ));
  } else {
    // Split by lines
    content = text.split('\n').map((line, index) => (
      <motion.div
        key={`line-${index}`}
        className={lineClassName}
        variants={childVariants}
      >
        {line}
      </motion.div>
    ));
  }

  // Create the component with the specified tag
  return React.createElement(
    motion[tag as keyof typeof motion] || motion.div,
    {
      className,
      variants: containerVariants,
      initial: 'hidden',
      animate: 'visible',
    },
    content
  );
}; 