import { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: '1',
    title: 'Romantic Love Letter Templates',
    slug: 'love-letter-templates',
    description: 'Express your deepest feelings with our beautifully crafted love letter templates. This collection includes 25 unique templates for different occasions - from first love confessions to anniversary celebrations. Each template is professionally designed with romantic typography and can be customized to make your message truly personal.',
    shortDescription: '25 beautifully crafted love letter templates for every romantic occasion.',
    price: 499,
    originalPrice: 999,
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=400&fit=crop',
    category: 'Templates',
    featured: true,
    bestseller: true,
    valentineSpecial: true,
    rating: 4.9,
    reviews: 342,
  },
  {
    id: '2',
    title: 'Digital Couple Planner 2024',
    slug: 'couple-planner-2024',
    description: 'Plan your year of love together with our comprehensive Digital Couple Planner. Features date night ideas, anniversary trackers, bucket list pages, and monthly relationship goals. Includes both PDF and Notion versions for ultimate flexibility.',
    shortDescription: 'Complete digital planner for couples with date ideas & trackers.',
    price: 799,
    originalPrice: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop',
    category: 'Planners',
    featured: true,
    bestseller: false,
    valentineSpecial: true,
    rating: 4.8,
    reviews: 189,
  },
  {
    id: '3',
    title: 'Valentine Photo Overlays Pack',
    slug: 'valentine-photo-overlays',
    description: 'Transform your couple photos with 50+ premium Valentine-themed overlays. Includes hearts, sparkles, rose petals, romantic frames, and dreamy bokeh effects. Compatible with Photoshop, Lightroom, and Canva.',
    shortDescription: '50+ romantic photo overlays for stunning couple photos.',
    price: 599,
    originalPrice: 1199,
    imageUrl: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&h=400&fit=crop',
    category: 'Graphics',
    featured: false,
    bestseller: true,
    valentineSpecial: true,
    rating: 4.7,
    reviews: 256,
  },
  {
    id: '4',
    title: 'Couple Quiz & Games Bundle',
    slug: 'couple-quiz-games',
    description: 'Deepen your connection with this fun collection of printable couple games. Includes "How Well Do You Know Me?" quiz, Love Language discovery game, Date Night Decision cards, and 52 conversation starters for meaningful talks.',
    shortDescription: 'Printable games & quizzes to strengthen your bond.',
    price: 399,
    originalPrice: 699,
    imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&h=400&fit=crop',
    category: 'Games',
    featured: true,
    bestseller: false,
    valentineSpecial: false,
    rating: 4.9,
    reviews: 412,
  },
  {
    id: '5',
    title: 'Romantic Recipe eBook',
    slug: 'romantic-recipe-ebook',
    description: 'Cook up love with 40 romantic dinner recipes designed for two. From aphrodisiac appetizers to decadent desserts, each recipe includes step-by-step photos, wine pairings, and table setting tips for the perfect romantic dinner at home.',
    shortDescription: '40 romantic dinner recipes with wine pairings.',
    price: 349,
    originalPrice: 599,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    category: 'eBooks',
    featured: false,
    bestseller: false,
    valentineSpecial: true,
    rating: 4.6,
    reviews: 178,
  },
  {
    id: '6',
    title: 'Wedding Vows Writing Guide',
    slug: 'wedding-vows-guide',
    description: 'Craft heartfelt, unforgettable wedding vows with our comprehensive guide. Includes writing prompts, examples from real weddings, tips from wedding planners, and a step-by-step framework to express your unique love story.',
    shortDescription: 'Complete guide to writing meaningful wedding vows.',
    price: 299,
    originalPrice: 499,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    category: 'Guides',
    featured: false,
    bestseller: true,
    valentineSpecial: false,
    rating: 4.8,
    reviews: 523,
  },
  {
    id: '7',
    title: 'LoveNotes iOS Wallpaper Pack',
    slug: 'lovenotes-wallpapers',
    description: 'Carry your love everywhere with 30 romantic iPhone wallpapers. Features aesthetic designs with love quotes, heart patterns, and customizable couple initials. Optimized for all iPhone sizes including iPhone 15 Pro Max.',
    shortDescription: '30 romantic iOS wallpapers with love quotes.',
    price: 199,
    originalPrice: 399,
    imageUrl: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=600&h=400&fit=crop',
    category: 'Wallpapers',
    featured: false,
    bestseller: false,
    valentineSpecial: true,
    rating: 4.5,
    reviews: 89,
  },
  {
    id: '8',
    title: 'Anniversary Scrapbook Templates',
    slug: 'anniversary-scrapbook',
    description: 'Create a beautiful memory book with our digital scrapbook templates. Includes 50 customizable pages, photo frames, romantic stickers, and milestone trackers. Perfect for printing or keeping digital. Works with Canva and PowerPoint.',
    shortDescription: '50 digital scrapbook pages for your love story.',
    price: 699,
    originalPrice: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop',
    category: 'Templates',
    featured: true,
    bestseller: true,
    valentineSpecial: false,
    rating: 4.9,
    reviews: 367,
  },
];

export const categories = ['All', 'Templates', 'Planners', 'Graphics', 'Games', 'eBooks', 'Guides', 'Wallpapers'];

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.featured);
};

export const getValentineSpecials = (): Product[] => {
  return products.filter(p => p.valentineSpecial);
};

export const getBestsellers = (): Product[] => {
  return products.filter(p => p.bestseller);
};
