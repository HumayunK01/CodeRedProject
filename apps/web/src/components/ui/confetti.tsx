import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export const Confetti = ({ show, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))', 
    'hsl(var(--success))',
    'hsl(var(--warning))',
  ];

  useEffect(() => {
    if (show) {
      const newParticles: ConfettiParticle[] = [];
      
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
        });
      }
      
      setParticles(newParticles);
      
      // Clear particles after animation
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [show]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              backgroundColor: particle.color,
              width: particle.size,
              height: particle.size,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 200,
              y: -50,
              rotate: particle.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: 2 + Math.random(),
              ease: "easeOut",
            }}
            exit={{ opacity: 0 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};