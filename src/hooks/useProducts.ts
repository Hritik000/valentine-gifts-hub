import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type DatabaseProduct = Tables<'products'>;

// Transform database product to frontend format
export const transformProduct = (product: DatabaseProduct) => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  description: product.description,
  shortDescription: product.short_description,
  price: product.price,
  originalPrice: product.original_price ?? undefined,
  imageUrl: product.image_url,
  category: product.category,
  featured: product.featured,
  bestseller: product.bestseller,
  valentineSpecial: product.valentine_special,
  rating: Number(product.rating),
  reviews: product.reviews,
});

export type TransformedProduct = ReturnType<typeof transformProduct>;

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? transformProduct(data) : null;
    },
    enabled: !!slug,
  });
};

export const useRelatedProducts = (category: string, excludeId: string) => {
  return useQuery({
    queryKey: ['products', 'related', category, excludeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', excludeId)
        .limit(4);

      if (error) throw error;
      return (data || []).map(transformProduct);
    },
    enabled: !!category && !!excludeId,
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category');

      if (error) throw error;
      const uniqueCategories = [...new Set((data || []).map(p => p.category))];
      return ['All', ...uniqueCategories.sort()];
    },
  });
};
