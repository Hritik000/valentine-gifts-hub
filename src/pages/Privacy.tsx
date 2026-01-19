import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Privacy = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">Last updated: January 2025</p>
            
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                LoveStore collects only minimal customer data necessary to process your orders and deliver digital products. This includes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Email address (for order confirmation and product delivery)</li>
                <li>Name (optional, for personalization)</li>
                <li>Order details (products purchased, order ID, timestamps)</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">2. Payment Information</h2>
              <p className="text-muted-foreground font-semibold">
                Important: LoveStore does NOT store any payment information.
              </p>
              <p className="text-muted-foreground mt-4">
                All payment transactions are processed securely through Razorpay and Stripe. We never have access to, store, or process your:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Credit or debit card numbers</li>
                <li>CVV or card security codes</li>
                <li>UPI IDs or bank account details</li>
                <li>Net banking credentials</li>
                <li>Digital wallet information</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Your payment data is handled directly by our payment partners using industry-standard encryption and security protocols.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Process your orders and deliver digital products</li>
                <li>Send order confirmations and download links</li>
                <li>Provide customer support when needed</li>
                <li>Improve our website and services</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p className="text-muted-foreground font-semibold">
                We do NOT sell, trade, or share your personal information with third parties.
              </p>
              <p className="text-muted-foreground mt-4">
                Your data is only shared with our payment processors (Razorpay and Stripe) solely for the purpose of completing your transaction. These partners are bound by their own privacy policies and security standards.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">5. Cookies</h2>
              <p className="text-muted-foreground">
                LoveStore uses essential cookies for basic website functionality only, such as maintaining your shopping cart session. We do not use tracking cookies or share cookie data with advertisers.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information. Our website uses SSL encryption to ensure secure data transmission. However, please note that no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
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

export default Privacy;
