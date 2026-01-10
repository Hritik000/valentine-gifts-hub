import { motion } from 'framer-motion';
import { Gift, Download, Shield, Heart } from 'lucide-react';

const features = [
  {
    icon: Download,
    title: 'Instant Download',
    description: 'Get your products immediately after purchase. No waiting, start creating now!',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment is protected with bank-grade security. Shop with confidence.',
  },
  {
    icon: Gift,
    title: 'Perfect Gifts',
    description: 'Thoughtfully designed products that make the perfect romantic gift.',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every product is crafted by romantics, for romantics. Quality guaranteed.',
  },
];

export const WhyChooseUs = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold">
            Why Couples Love Us
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            We're committed to making your romantic journey as beautiful as possible
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blush border border-primary/20 mb-4 group-hover:shadow-glow transition-shadow">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
