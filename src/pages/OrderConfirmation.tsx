import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Loader2, Package, ArrowRight, Heart, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDownloadProduct } from '@/hooks/useDownloadProduct';

interface OrderProduct {
  id: string;
  title: string;
  price: number;
  image_url: string;
}

interface OrderInfo {
  id: string;
  status: string;
  total: number;
  items: OrderProduct[];
  hasFiles: boolean;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { downloadProduct, isDownloading } = useDownloadProduct();

  useEffect(() => {
    const verifyOrder = async () => {
      // SECURITY: Order confirmation requires a valid orderId
      if (!orderId) {
        setVerificationError('No order ID provided. Please complete a purchase to access this page.');
        setLoading(false);
        return;
      }

      try {
        // Verify order via Edge Function (server-side verification)
        const { data, error } = await supabase.functions.invoke('verify-order', {
          body: { orderId }
        });

        if (error) {
          console.error('Order verification error:', error);
          setVerificationError('Unable to verify order. Please try again.');
          setLoading(false);
          return;
        }

        if (!data?.valid) {
          setVerificationError(data?.error || 'Order not found or payment not verified.');
          setLoading(false);
          return;
        }

        // Order verified successfully
        setOrderInfo(data.order);
      } catch (err) {
        console.error('Error verifying order:', err);
        setVerificationError('An error occurred while verifying your order.');
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [orderId]);

  const handleDownload = async (productId: string) => {
    if (!orderId) {
      toast.error('Download not available', {
        description: 'Order verification required for downloads.',
      });
      return;
    }

    // Use secure Edge Function that verifies purchase before generating signed URL
    await downloadProduct(productId, orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your order...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error if order verification failed
  if (verificationError) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Order Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{verificationError}</p>
            <Link to="/products">
              <Button variant="romantic">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No order info (shouldn't happen if verification passed)
  if (!orderInfo) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">No Order Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find your order details.</p>
            <Link to="/products">
              <Button variant="romantic">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-muted-foreground">
            Your payment has been verified. Download your products below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold mb-6">Your Products</h2>
              
              <div className="space-y-4">
                {orderInfo.items.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-lg">{product.title}</h3>
                      <p className="text-primary font-bold">₹{product.price}</p>
                    </div>
                    <Button
                      variant="romantic"
                      size="sm"
                      onClick={() => handleDownload(product.id)}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blush rounded-lg text-center">
                <p className="text-sm flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  Thank you for supporting LoveStore!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link to="/products">
            <Button variant="outline">
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
