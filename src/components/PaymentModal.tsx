import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Loader2, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

export const PaymentModal = ({ isOpen, onClose, product }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'stripe' | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const createOrder = async (paymentMethod: string, paymentId?: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          productId: product.id,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim() || null,
          paymentMethod,
          paymentId,
        }
      });

      if (error) {
        console.error('Order creation error:', error);
        throw new Error(error.message || 'Failed to create order');
      }

      if (!data?.orderId) {
        throw new Error('No order ID received');
      }

      return data.orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async (method: 'razorpay' | 'stripe') => {
    // Validate email before proceeding
    if (!customerEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(customerEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      if (method === 'razorpay') {
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!razorpayKey) {
          toast.info('Razorpay integration pending', {
            description: 'Processing with demo payment...',
          });
          // Create order server-side for demo
          const orderId = await createOrder('demo');
          if (orderId) {
            window.location.href = `/order-confirmation?orderId=${orderId}`;
          }
          return;
        }

        await initiateRazorpayPayment(product, razorpayKey);
      } else {
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          toast.info('Stripe integration pending', {
            description: 'Processing with demo payment...',
          });
          // Create order server-side for demo
          const orderId = await createOrder('demo');
          if (orderId) {
            window.location.href = `/order-confirmation?orderId=${orderId}`;
          }
          return;
        }

        await initiateStripePayment(product);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error instanceof Error ? error.message : 'Please try again or use a different payment method.',
      });
    } finally {
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  const initiateRazorpayPayment = async (product: { id: string; title: string; price: number }, key: string) => {
    const options = {
      key,
      amount: product.price * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'LoveStore',
      description: product.title,
      prefill: {
        email: customerEmail,
        name: customerName,
      },
      handler: async function (response: { razorpay_payment_id: string }) {
        try {
          // Create order server-side with payment ID
          const orderId = await createOrder('razorpay', response.razorpay_payment_id);
          if (orderId) {
            window.location.href = `/order-confirmation?orderId=${orderId}`;
          }
        } catch (error) {
          console.error('Error creating order after payment:', error);
          toast.error('Order creation failed', {
            description: 'Payment received but order creation failed. Please contact support.',
          });
        }
      },
      theme: {
        color: '#E11D48',
      },
    };

    // @ts-ignore - Razorpay would be loaded from script
    if (window.Razorpay) {
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Fallback for demo - create order server-side
      const orderId = await createOrder('demo');
      if (orderId) {
        window.location.href = `/order-confirmation?orderId=${orderId}`;
      }
    }
  };

  const initiateStripePayment = async (product: { id: string; title: string; price: number }) => {
    // For now, create order with demo payment
    // In production, this would redirect to Stripe Checkout
    const orderId = await createOrder('demo');
    if (orderId) {
      window.location.href = `/order-confirmation?orderId=${orderId}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Complete Your Purchase</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Summary */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-xl font-bold text-primary">₹{product.price}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input
                id="email"
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
                Download link will be sent to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">Choose your payment method</p>
            
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4 hover:border-primary hover:bg-primary/5"
              onClick={() => handlePayment('razorpay')}
              disabled={isProcessing}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Pay with Razorpay</div>
                <div className="text-sm text-muted-foreground">UPI, Cards, Netbanking (India)</div>
              </div>
              {isProcessing && selectedMethod === 'razorpay' && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start gap-4 hover:border-primary hover:bg-primary/5"
              onClick={() => handlePayment('stripe')}
              disabled={isProcessing}
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Pay with Stripe</div>
                <div className="text-sm text-muted-foreground">International Cards</div>
              </div>
              {isProcessing && selectedMethod === 'stripe' && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Shield className="w-4 h-4" />
            <span>Secure payment • Instant digital delivery</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
