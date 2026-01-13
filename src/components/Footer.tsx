import { Link } from 'react-router-dom';
import { Heart, Instagram, Twitter } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="font-display text-lg font-semibold">
                Love<span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Spreading love through beautiful digital products. Make every moment romantic.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            Made with <Heart className="w-4 h-4 inline text-primary fill-primary" /> for lovers everywhere
          </p>
          <p className="mt-2">© {new Date().getFullYear()} LoveStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
