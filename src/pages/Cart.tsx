import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { CartCheckoutModal } from '@/components/CartCheckoutModal';
import { Trash2, ShoppingBag, ArrowRight, Shield, Lock, Package } from 'lucide-react';

const Cart = () => {
  const { items, removeFromCart, getTotal, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const total = getTotal();
  const itemCount = items.length;

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="w-24 h-24 rounded-full bg-blush flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any romantic goodies yet. Explore our collection!
            </p>
            <Link to="/products">
              <Button variant="romantic" size="lg">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Your Cart</h1>
          <p className="text-muted-foreground mb-8">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4">
                      <Link to={`/product/${item.slug}`}>
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-24 h-20 sm:w-32 sm:h-24 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link to={`/product/${item.slug}`}>
                              <h3 className="font-display font-semibold hover:text-primary transition-colors line-clamp-1">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Package className="w-3 h-3" />
                              <span>Digital Download</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-xl font-bold text-primary">
                              ₹{item.price}
                            </span>
                            {item.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Button
              variant="ghost"
              onClick={clearCart}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card variant="romantic" className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600">Instant Download</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total Payable</span>
                      <span className="text-2xl text-primary">₹{total}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="romantic" 
                  size="lg" 
                  className="w-full mb-4"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment • Instant download</span>
                </div>

                <div className="mt-6 p-4 bg-blush rounded-lg border border-primary/10">
                  <p className="text-sm text-center">
                    📥 <strong>Instant Delivery:</strong> Download your products immediately after payment
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
      
      <CartCheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  );
};

export default Cart;
