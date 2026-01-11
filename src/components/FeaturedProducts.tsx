import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { useFeaturedProducts } from '@/hooks/useProducts';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';

export const FeaturedProducts = () => {
  const { data: featuredProducts = [], isLoading, error } = useFeaturedProducts();

  // Don't render the section if there's an error or no products
  if (error || (!isLoading && featuredProducts.length === 0)) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-wide">
            Curated with Love
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mt-2">
            Featured Products
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Our most loved digital products, handpicked to make your romantic moments extraordinary
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading featured products...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/products">
            <Button variant="outline" size="lg" className="group">
              View All Products
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
