import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

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

  const handlePayment = async (method: 'razorpay' | 'stripe') => {
    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      // For now, simulate payment processing
      // In production, this would integrate with actual payment gateways
      
      if (method === 'razorpay') {
        // Razorpay integration placeholder
        // The actual Razorpay key would come from environment variables
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        
        if (!razorpayKey) {
          toast.info('Razorpay integration pending', {
            description: 'Payment gateway will be configured soon.',
          });
          // Simulate successful payment for demo
          await simulatePaymentSuccess(product.id);
          return;
        }

        // Actual Razorpay integration would go here
        await initiateRazorpayPayment(product, razorpayKey);
      } else {
        // Stripe integration placeholder
        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        
        if (!stripeKey) {
          toast.info('Stripe integration pending', {
            description: 'Payment gateway will be configured soon.',
          });
          // Simulate successful payment for demo
          await simulatePaymentSuccess(product.id);
          return;
        }

        // Actual Stripe integration would go here
        await initiateStripePayment(product);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: 'Please try again or use a different payment method.',
      });
    } finally {
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  const simulatePaymentSuccess = async (productId: string) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect to order confirmation with product info
    const params = new URLSearchParams({
      productId,
      status: 'success',
    });
    window.location.href = `/order-confirmation?${params.toString()}`;
  };

  const initiateRazorpayPayment = async (product: { id: string; title: string; price: number }, key: string) => {
    // This would use the Razorpay SDK
    // For now, we'll show a placeholder
    const options = {
      key,
      amount: product.price * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'LoveStore',
      description: product.title,
      handler: function () {
        window.location.href = `/order-confirmation?productId=${product.id}&status=success`;
      },
      prefill: {},
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
      // Fallback for demo
      await simulatePaymentSuccess(product.id);
    }
  };

  const initiateStripePayment = async (product: { id: string; title: string; price: number }) => {
    // This would redirect to Stripe Checkout
    // For now, simulate success
    await simulatePaymentSuccess(product.id);
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
