import { useState } from 'react';
import { Smartphone, Loader2, Shield, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [emailError, setEmailError] = useState('');

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
          amount: product.price,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            productId: product.id,
            customerEmail: customerEmail.trim(),
          },
        }
      });

      if (orderError || !orderData?.orderId) {
        console.error('Razorpay order creation failed:', orderError);
        throw new Error('Failed to create payment order');
      }

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LoveStore',
        description: product.title,
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
                items: [{ id: product.id, title: product.title, price: product.price, quantity: 1 }],
                customerEmail: customerEmail.trim(),
                customerName: customerName.trim() || null,
                total: product.price,
              }
            });

            if (verifyError || !verifyData?.valid) {
              console.error('Payment verification failed:', verifyError);
              toast.error('Payment verification failed', {
                description: 'Please contact support if amount was deducted.',
              });
              return;
            }

            // Success! Redirect to confirmation
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
                Your download will be available instantly after payment
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
            {isProcessing ? 'Processing...' : `Pay ₹${product.price} with Razorpay`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            UPI, Debit/Credit Cards, Net Banking, Wallets
          </p>

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
