import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let valentinesDay = new Date(currentYear, 1, 14); // Feb 14
      
      // If Valentine's Day has passed, target next year
      if (now > valentinesDay) {
        valentinesDay = new Date(currentYear + 1, 1, 14);
      }
      
      const difference = valentinesDay.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {timeBlocks.map((block, index) => (
        <motion.div
          key={block.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="relative group">
            {/* Outer glow ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-rose to-gold rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-glow" />
            
            {/* Main timer block */}
            <div className="relative bg-card/90 backdrop-blur-md border-2 border-primary/30 rounded-2xl p-4 sm:p-6 min-w-[80px] sm:min-w-[100px] shadow-elevated overflow-hidden">
              {/* Inner shimmer effect */}
              <div className="absolute inset-0 shimmer-overlay" />
              
              {/* Animated number */}
              <motion.span
                key={block.value}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative block text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary drop-shadow-glow"
              >
                {block.value.toString().padStart(2, '0')}
              </motion.span>
              
              {/* Sparkle decorations */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              />
              <motion.div
                className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-primary rounded-full"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.3 }}
              />
            </div>
          </div>
          
          {/* Label */}
          <span className="mt-3 text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-wider">
            {block.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
