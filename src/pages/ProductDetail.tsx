import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useProductBySlug, useRelatedProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { PaymentModal } from '@/components/PaymentModal';
import { SampleImagesGallery } from '@/components/SampleImagesGallery';
import { useCart } from '@/contexts/CartContext';
import { 
  Heart, ShoppingBag, ShoppingCart, Download, Shield, ArrowLeft, 
  FileText, Clock, RefreshCw, Loader2, Check 
} from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProductBySlug(slug || '');
  const { data: relatedProducts = [] } = useRelatedProducts(
    product?.category || '', 
    product?.id || ''
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { addToCart, isInCart } = useCart();
  
  const inCart = product ? isInCart(product.id) : false;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading product...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // Error or not found
  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or is no longer available.</p>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  const features = [
    { icon: Download, text: 'Instant digital download' },
    { icon: FileText, text: 'High-quality files included' },
    { icon: Clock, text: 'Lifetime access' },
    { icon: RefreshCw, text: 'Free updates' },
    { icon: Shield, text: 'Secure payment' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </motion.div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.valentineSpecial && (
                <span className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current" /> Valentine Special
                </span>
              )}
              {discount > 0 && (
                <span className="bg-gold text-accent-foreground text-sm font-bold px-3 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Sample Images Gallery */}
            {product.sampleImages && product.sampleImages.length > 0 && (
              <SampleImagesGallery images={product.sampleImages} productTitle={product.title} />
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              {product.category}
            </span>
            
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-6 p-4 bg-blush rounded-xl border border-primary/10">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-display font-bold text-primary">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                      Save ₹{product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="mt-6 space-y-3">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <Button
                variant="romantic"
                size="xl"
                className="w-full"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <ShoppingBag className="w-5 h-5" />
                Buy Now - ₹{product.price}
              </Button>
              
              <Button
                variant={inCart ? "outline" : "secondary"}
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>

            {/* Trust */}
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure checkout • Instant download after payment</span>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-bold mb-8">You May Also Love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        product={{
          id: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
};

export default ProductDetail;
