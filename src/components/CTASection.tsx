import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Heart } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-romantic p-8 sm:p-12 lg:p-16"
        >
          {/* Decorative hearts */}
          <div className="absolute top-4 left-4 opacity-20">
            <Heart className="w-24 h-24 text-white fill-white" />
          </div>
          <div className="absolute bottom-4 right-4 opacity-20">
            <Heart className="w-32 h-32 text-white fill-white" />
          </div>

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Ready to Make This Valentine's
              <br />
              Truly Special?
            </h2>
            <p className="mt-6 text-lg text-white/90 max-w-xl mx-auto">
              Join thousands of couples who made their love stories more beautiful with our premium digital products.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products">
                <Button 
                  variant="gold" 
                  size="xl" 
                  className="bg-white text-primary hover:bg-white/90 group"
                >
                  Shop Now & Save 50%
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/70">
              ✨ Limited time Valentine's Week offer
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
