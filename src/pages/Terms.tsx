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
            <p className="text-muted-foreground">Last updated: February 2024</p>
            
            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using LoveStore, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access our service.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">2. Digital Products</h2>
              <p className="text-muted-foreground mb-4">
                All products sold on LoveStore are digital downloads. Upon successful payment:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You will receive instant access to download your purchased products</li>
                <li>Download links are valid for 30 days from purchase</li>
                <li>Products are for personal use only unless otherwise stated</li>
                <li>Redistribution or resale of products is prohibited</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">3. Pricing & Payment</h2>
              <p className="text-muted-foreground">
                All prices are listed in Indian Rupees (INR). We reserve the right to modify prices at any time. Payment is processed securely through Razorpay. We accept major credit cards, debit cards, UPI, and net banking.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">4. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on LoveStore, including designs, templates, and graphics, is protected by copyright. Purchasing a product grants you a personal license to use the product but does not transfer ownership of intellectual property rights.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                LoveStore shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our products or services.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">6. Contact</h2>
              <p className="text-muted-foreground">
                For any questions regarding these Terms & Conditions, please contact us at hello@lovestore.com.
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
