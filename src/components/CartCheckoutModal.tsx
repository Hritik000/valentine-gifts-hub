import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Loader2, Shield, Mail, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    email: string;
    name?: string;
  };
  handler: (response: RazorpayResponse) => void;
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartCheckoutModal = ({ isOpen, onClose }: CartCheckoutModalProps) => {
  const { items, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [emailError, setEmailError] = useState('');

  const total = getTotal();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Validate email before proceeding
    if (!customerEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(customerEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty', {
        description: 'Add some products to your cart first.',
      });
      return;
    }

    setEmailError('');
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Create Razorpay order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: total,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            customerEmail: customerEmail.trim(),
            itemCount: items.length,
          },
        }
      });

      if (orderError || !orderData?.orderId) {
        console.error('Razorpay order creation failed:', orderError);
        throw new Error('Failed to create payment order');
      }

      // Prepare cart items for verification
      const orderItems = items.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      }));

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LoveStore',
        description: `Order of ${items.length} item${items.length > 1 ? 's' : ''}`,
        order_id: orderData.orderId,
        prefill: {
          email: customerEmail.trim(),
          name: customerName.trim() || undefined,
        },
        handler: async function (response: RazorpayResponse) {
          try {
            // Verify payment server-side and create order
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: orderItems,
                customerEmail: customerEmail.trim(),
                customerName: customerName.trim() || null,
                total,
              }
            });

            if (verifyError || !verifyData?.valid) {
              console.error('Payment verification failed:', verifyError);
              toast.error('Payment verification failed', {
                description: 'Please contact support if amount was deducted.',
              });
              return;
            }

            // Success! Clear cart and redirect
            clearCart();
            window.location.href = `/order-confirmation?orderId=${verifyData.orderId}`;
          } catch (error) {
            console.error('Error after payment:', error);
            toast.error('Order creation failed', {
              description: 'Payment received but order creation failed. Please contact support.',
            });
          }
        },
        theme: {
          color: '#E11D48',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cart Summary */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">Order Summary ({items.length} items)</h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <p className="font-bold text-primary">₹{item.price}</p>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-medium">Total Payable</span>
              <span className="text-2xl font-display font-bold text-primary">₹{total}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checkout-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="checkout-email"
                type="email"
                placeholder="your@email.com"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setEmailError('');
                }}
                className={emailError ? 'border-red-500' : ''}
                disabled={isProcessing}
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your download access will be available on the success page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout-name">Name (optional)</Label>
              <Input
                id="checkout-name"
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Payment Button */}
          <Button
            variant="romantic"
            className="w-full h-auto py-4 text-lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Smartphone className="w-5 h-5 mr-2" />
            )}
            {isProcessing ? 'Processing...' : `Pay ₹${total} with Razorpay`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            UPI, Debit/Credit Cards, Net Banking, Wallets
          </p>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Shield className="w-4 h-4" />
            <span>Secure payment • Instant download after payment</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};