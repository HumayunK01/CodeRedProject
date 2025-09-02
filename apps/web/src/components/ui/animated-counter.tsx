import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter = ({ 
  value, 
  duration = 1000,
  className = "" 
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Handle numeric values
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    : value;

  const isPercentage = typeof value === 'string' && value.includes('%');
  const prefix = typeof value === 'string' ? value.replace(/[0-9.%]/g, '') : '';

  useEffect(() => {
    if (numericValue === 0) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = easeOutQuart * numericValue;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [numericValue, duration]);

  const formatValue = (val: number) => {
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    if (numericValue >= 1000) {
      return `${prefix}${Math.round(val).toLocaleString()}`;
    }
    return `${prefix}${Math.round(val)}`;
  };

  return (
    <motion.span 
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {typeof value === 'string' && isNaN(numericValue) 
        ? value 
        : formatValue(displayValue)}
    </motion.span>
  );
};