import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { SparkleEffect } from './SparkleEffect';
import heroIllustration from '@/assets/hero-illustration.png';

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden gradient-hero">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blush rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            {/* Valentine Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blush border border-primary/20 rounded-full px-4 py-2 mb-6 shimmer-badge"
            >
              <Heart className="w-4 h-4 text-primary fill-primary animate-heart-beat" />
              <span className="text-sm font-medium text-foreground">Valentine Week Sale — Up to 50% Off!</span>
              <Sparkles className="w-4 h-4 text-gold animate-sparkle" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              Make This Valentine's
              <br />
              <SparkleEffect>
                <span className="text-gradient-romantic">Unforgettable</span>
              </SparkleEffect>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              Discover premium digital products crafted with love — from romantic templates 
              to couple planners. Express your feelings beautifully.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link to="/products">
                <SparkleEffect>
                  <Button variant="romantic" size="xl" className="group shimmer-button">
                    Shop Valentine Collection
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </SparkleEffect>
              </Link>
              <Link to="/products?category=Templates">
                <Button variant="outline" size="lg">
                  Browse Templates
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Instant Download
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Secure Payment
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                5000+ Happy Couples
              </div>
            </motion.div>
          </div>

          {/* Right side - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow effect behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-rose/20 to-gold/30 rounded-full blur-3xl scale-110 animate-pulse-glow" />
              
              {/* Main illustration */}
              <motion.img
                src={heroIllustration}
                alt="Romantic couple illustration"
                className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Floating decorative hearts */}
              <motion.div
                className="absolute -top-4 -right-4 text-primary"
                animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart size={32} fill="currentColor" className="drop-shadow-lg" />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-6 text-gold"
                animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Heart size={24} fill="currentColor" className="drop-shadow-lg" />
              </motion.div>
              <motion.div
                className="absolute top-1/2 -right-8 text-primary/60"
                animate={{ y: [0, -8, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Heart size={20} fill="currentColor" className="drop-shadow-lg" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Countdown Timer - Centered below */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Valentine's Day Countdown
          </p>
          <CountdownTimer />
        </motion.div>
      </div>
    </section>
  );
};
