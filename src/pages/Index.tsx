import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { FloatingHearts } from '@/components/FloatingHearts';

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <FloatingHearts />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <WhyChooseUs />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
