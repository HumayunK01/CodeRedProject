import { motion } from 'framer-motion';

interface ProbabilityGaugeProps {
  probability: number; // 0-1
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProbabilityGauge = ({ 
  probability, 
  size = 120, 
  strokeWidth = 8,
  className = "" 
}: ProbabilityGaugeProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (probability * circumference);
  
  // Color based on probability
  const getColor = (prob: number) => {
    if (prob < 0.3) return "hsl(var(--success))";
    if (prob < 0.7) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getRiskLevel = (prob: number) => {
    if (prob < 0.3) return "Low Risk";
    if (prob < 0.7) return "Medium Risk";
    return "High Risk";
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(probability)}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ 
            duration: 1.5, 
            ease: "easeInOut",
            delay: 0.2 
          }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className="text-2xl font-bold"
          style={{ color: getColor(probability) }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {Math.round(probability * 100)}%
        </motion.span>
        <motion.span 
          className="text-xs text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          {getRiskLevel(probability)}
        </motion.span>
      </div>
    </div>
  );
};