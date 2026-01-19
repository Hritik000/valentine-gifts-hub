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
          <h1 className="font-display text-4xl font-bold mb-8">Refund & Cancellation Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">Last updated: January 2025</p>
            
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">1. No Refunds for Digital Products</h2>
              <p className="text-muted-foreground">
                Due to the nature of digital products, all sales on LoveStore are final. Once a digital product (such as printable cards, love letters, invitations, or downloadable templates) has been purchased and delivered, we cannot offer refunds or cancellations.
              </p>
              <p className="text-muted-foreground mt-4">
                Digital products are delivered instantly upon successful payment, making it impossible to return or cancel the purchase after delivery.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">2. Exceptions</h2>
              <p className="text-muted-foreground mb-4">
                Refunds may only be considered under the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The downloaded file is corrupted, inaccessible, or technically defective</li>
                <li>You did not receive the download link after successful payment</li>
                <li>The product delivered is significantly different from what was described</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">3. How to Request Support</h2>
              <p className="text-muted-foreground">
                If you experience any technical issues with your purchase, please contact us within 48 hours of your purchase at:
              </p>
              <p className="text-foreground font-semibold mt-2">
                Email: Lovestoresupp@gmail.com
              </p>
              <p className="text-muted-foreground mt-4">
                Please include your order ID, email address used for purchase, and a detailed description of the issue you're facing. Our team will review your request and respond within 2-3 business days.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">4. Cancellation Policy</h2>
              <p className="text-muted-foreground">
                Since digital products are delivered instantly upon payment confirmation, cancellation requests cannot be processed after purchase. Please review your order carefully before completing the payment.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">5. Contact Us</h2>
              <p className="text-muted-foreground">
                For any questions regarding our Refund & Cancellation Policy, please contact us at:
              </p>
              <p className="text-foreground font-semibold mt-2">
                Email: Lovestoresupp@gmail.com
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
