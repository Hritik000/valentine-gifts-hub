import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Loader2, Package, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useDownloadProduct } from '@/hooks/useDownloadProduct';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  hasFile?: boolean;
}

interface Order {
  id: string;
  status: string;
  total: number;
  items: OrderItem[];
  customer_email: string;
  created_at: string;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { downloadProduct, isDownloading } = useDownloadProduct();
  const [downloadingProductId, setDownloadingProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Check which products have downloadable files
        const productIds = (orderData.items as unknown as OrderItem[]).map(item => item.id);
        const { data: products } = await supabase
          .from('products')
          .select('id, file_url')
          .in('id', productIds);

        const productsWithFiles = new Set(
          products?.filter(p => p.file_url).map(p => p.id) || []
        );

        const itemsWithFileInfo = (orderData.items as unknown as OrderItem[]).map(item => ({
          ...item,
          hasFile: productsWithFiles.has(item.id)
        }));

        setOrder({
          ...orderData,
          items: itemsWithFileInfo
        } as Order);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleDownload = async (productId: string) => {
    if (!orderId) return;
    setDownloadingProductId(productId);
    await downloadProduct(productId, orderId);
    setDownloadingProductId(null);
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

  if (error || !order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center max-w-md mx-auto">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'We could not find your order.'}</p>
            <Link to="/products">
              <Button variant="romantic">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isCompleted = order.status === 'completed';

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
            {isCompleted ? 'Thank You for Your Purchase!' : 'Order Received'}
          </h1>
          <p className="text-muted-foreground">
            {isCompleted 
              ? 'Your order is complete. Download your products below.'
              : 'Your order is being processed. Downloads will be available once payment is confirmed.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Order ID: <span className="font-mono">{order.id.slice(0, 8)}</span>
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
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (index + 1) }}
                    className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">₹{item.price}</p>
                    </div>
                    {item.hasFile && isCompleted && (
                      <Button
                        variant="romantic"
                        size="sm"
                        onClick={() => handleDownload(item.id)}
                        disabled={isDownloading && downloadingProductId === item.id}
                      >
                        {isDownloading && downloadingProductId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    )}
                    {!item.hasFile && isCompleted && (
                      <span className="text-xs text-muted-foreground">No file attached</span>
                    )}
                    {!isCompleted && (
                      <span className="text-xs text-amber-600">Pending</span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Paid</span>
                  <span className="text-xl font-bold text-primary">₹{order.total}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blush rounded-lg">
                <p className="text-sm text-center">
                  📧 A confirmation email has been sent to <strong>{order.customer_email}</strong>
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
