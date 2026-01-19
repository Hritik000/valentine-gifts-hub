import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-4xl font-bold mb-8">Terms & Conditions</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">Last updated: January 2025</p>
            
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using LoveStore, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access our service.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">2. Digital Products</h2>
              <p className="text-muted-foreground mb-4">
                LoveStore exclusively sells digital products including, but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Printable cards and love letters</li>
                <li>Digital invitations</li>
                <li>Downloadable templates</li>
                <li>Other digital romantic content</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                All digital products are delivered instantly upon successful payment. You will receive immediate access to download your purchased products.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">3. License & Usage</h2>
              <p className="text-muted-foreground mb-4">
                Upon purchase, you are granted a personal-use license for the digital products. This means:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Products are for personal use only</li>
                <li>Resale or redistribution of products is strictly prohibited</li>
                <li>Commercial use is not permitted unless explicitly stated</li>
                <li>You may not claim ownership of the original designs</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">4. Payment Processing</h2>
              <p className="text-muted-foreground">
                All payments on LoveStore are processed securely through Razorpay and Stripe. We accept major credit cards, debit cards, UPI, net banking, and digital wallets.
              </p>
              <p className="text-muted-foreground mt-4 font-semibold">
                Important: LoveStore does not store your payment details, card information, UPI IDs, or banking credentials. All payment data is handled securely by our payment partners.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">5. Refund Policy</h2>
              <p className="text-muted-foreground">
                Due to the nature of digital products and instant delivery, all sales are final. No refunds or cancellations are available after purchase. For complete details, please refer to our <a href="/refund" className="text-primary hover:underline">Refund & Cancellation Policy</a>.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on LoveStore, including designs, templates, graphics, text, and branding, is the intellectual property of LoveStore and is protected by copyright laws. Purchasing a product grants you a personal license to use the product but does not transfer ownership of intellectual property rights.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                LoveStore shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our products or services. Our total liability is limited to the amount paid for the specific product in question.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">8. Changes to Terms</h2>
              <p className="text-muted-foreground">
                LoveStore reserves the right to update or modify these Terms & Conditions at any time without prior notice. Continued use of the website after any changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                For any questions regarding these Terms & Conditions, please contact us at:
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

export default Terms;
