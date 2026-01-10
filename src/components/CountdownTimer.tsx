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
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {timeBlocks.map((block, index) => (
        <motion.div
          key={block.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-card/80 backdrop-blur-sm border border-primary/20 rounded-xl p-3 sm:p-4 min-w-[70px] sm:min-w-[80px] shadow-card">
            <motion.span
              key={block.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="block text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary"
            >
              {block.value.toString().padStart(2, '0')}
            </motion.span>
          </div>
          <span className="mt-2 text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {block.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
};
