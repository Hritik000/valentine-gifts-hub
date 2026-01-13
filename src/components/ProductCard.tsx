import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card variant="romantic" className="group overflow-hidden h-full flex flex-col">
        <Link to={`/product/${product.slug}`} className="block relative overflow-hidden">
          <div className="aspect-[4/3] overflow-hidden">
            <motion.img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.valentineSpecial && (
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" /> Valentine Special
              </span>
            )}
            {discount > 0 && (
              <span className="bg-gold text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>

          {product.bestseller && (
            <span className="absolute top-3 right-3 bg-foreground text-background text-xs font-semibold px-2 py-1 rounded-full">
              Bestseller
            </span>
          )}
        </Link>

        <CardContent className="flex-1 flex flex-col p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {product.category}
          </span>
          
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-display text-lg font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
            {product.shortDescription}
          </p>

          {/* Price & View Details */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-display font-bold text-primary">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            
            <Link to={`/product/${product.slug}`}>
              <Button size="sm" variant="romantic">
                View
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
