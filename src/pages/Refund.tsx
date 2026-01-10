import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Refund = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">Last updated: February 2024</p>
            
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">7-Day Money-Back Guarantee</h2>
              <p className="text-muted-foreground">
                We want you to be completely satisfied with your purchase. If you're not happy with a product for any reason, you may request a refund within 7 days of your purchase date.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Eligible Refunds</h2>
              <p className="text-muted-foreground mb-4">Refunds are available when:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The product is significantly different from the description</li>
                <li>Technical issues prevent you from using the product</li>
                <li>You request a refund within 7 days of purchase</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Non-Refundable Situations</h2>
              <p className="text-muted-foreground mb-4">Refunds may not be issued for:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Requests made after 7 days from the purchase date</li>
                <li>Products that have been fully downloaded and used</li>
                <li>Change of mind after purchasing and using the product</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">How to Request a Refund</h2>
              <p className="text-muted-foreground mb-4">To request a refund:</p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                <li>Email us at hello@lovestore.com with your order number</li>
                <li>Explain the reason for your refund request</li>
                <li>We will review your request within 2-3 business days</li>
                <li>If approved, refunds will be processed within 5-7 business days</li>
              </ol>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Refund Method</h2>
              <p className="text-muted-foreground">
                Refunds will be credited to the original payment method used during purchase. Please allow 5-7 business days for the refund to reflect in your account.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Questions?</h2>
              <p className="text-muted-foreground">
                If you have any questions about our refund policy, please don't hesitate to contact us at hello@lovestore.com. We're here to help!
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Refund;
