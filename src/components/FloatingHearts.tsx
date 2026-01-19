import { Heart } from 'lucide-react';
import { useMemo } from 'react';

interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

export const FloatingHearts = () => {
  // Generate hearts once on mount using useMemo to prevent re-renders
  const hearts = useMemo<FloatingHeart[]>(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      size: 12 + Math.random() * 16,
      opacity: 0.08 + Math.random() * 0.15,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-primary animate-float-heart"
          style={{ 
            left: `${heart.x}%`,
            opacity: heart.opacity,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            willChange: 'transform',
          }}
        >
          <Heart 
            size={heart.size} 
            fill="currentColor" 
            className="text-primary/30"
          />
        </div>
      ))}
    </div>
  );
};
