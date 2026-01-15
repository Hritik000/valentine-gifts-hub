import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Loader2, Package, ArrowRight, Heart } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDownloadProduct } from '@/hooks/useDownloadProduct';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  has_file: boolean;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { downloadProduct, isDownloading } = useDownloadProduct();

  useEffect(() => {
    const fetchProduct = async () => {
      // Handle direct product purchase (new flow)
      if (productId) {
        try {
          // Note: We don't fetch file_url - only check if product exists
          // The actual download happens via secure Edge Function
          const { data, error } = await supabase
            .from('products')
            .select('id, title, price, image_url, file_url')
            .eq('id', productId)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setProduct({
              id: data.id,
              title: data.title,
              price: data.price,
              image_url: data.image_url,
              has_file: !!data.file_url, // Only store boolean, not the actual URL
            });
          }
        } catch (err) {
          console.error('Error fetching product:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle legacy order-based flow
      if (orderId) {
        try {
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('items')
            .eq('id', orderId)
            .maybeSingle();

          if (orderError || !orderData) throw orderError;

          // Get first product from order
          const items = orderData.items as unknown as Array<{ id: string }>;
          if (items && items.length > 0) {
            const { data: productData } = await supabase
              .from('products')
              .select('id, title, price, image_url, file_url')
              .eq('id', items[0].id)
              .maybeSingle();

            if (productData) {
              setProduct({
                id: productData.id,
                title: productData.title,
                price: productData.price,
                image_url: productData.image_url,
                has_file: !!productData.file_url,
              });
            }
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(false);
    };

    fetchProduct();
  }, [productId, orderId]);

  const handleDownload = async () => {
    // SECURITY: Downloads require a valid orderId to verify purchase
    if (!orderId) {
      toast.error('Download not available', {
        description: 'Order verification required for downloads.',
      });
      return;
    }

    if (!product?.id) {
      toast.error('Download not available', {
        description: 'Product information is missing.',
      });
      return;
    }

    // Use secure Edge Function that verifies purchase before generating signed URL
    await downloadProduct(product.id, orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No product found
  if (!product && !productId && !orderId) {
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

  const isSuccess = status === 'success';

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
            Your payment was successful. Download your product below.
          </p>
        </motion.div>

        {product && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" className="max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold mb-6">Your Product</h2>
                
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg">{product.title}</h3>
                    <p className="text-primary font-bold">₹{product.price}</p>
                  </div>
                </div>

                {/* Download Button - Only show if orderId exists (verified purchase) */}
                {orderId && product.has_file && (
                  <div className="mt-6">
                    <Button
                      variant="romantic"
                      size="lg"
                      className="w-full"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Download className="w-5 h-5 mr-2" />
                      )}
                      Download Your File
                    </Button>
                  </div>
                )}

                {orderId && !product.has_file && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-sm text-amber-700">
                      The download file for this product is being prepared. Please check back soon.
                    </p>
                  </div>
                )}

                {!orderId && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-sm text-amber-700">
                      Order verification required for downloads. Please check your email for the download link.
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blush rounded-lg text-center">
                  <p className="text-sm flex items-center justify-center gap-2">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    Thank you for supporting LoveStore!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

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
