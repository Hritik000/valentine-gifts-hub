import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, FileCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const productSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().min(5, 'Short description must be at least 5 characters'),
  price: z.coerce.number().min(1, 'Price must be at least 1'),
  original_price: z.coerce.number().optional(),
  image_url: z.string().url('Must be a valid URL'),
  category: z.string().min(2, 'Category is required'),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  valentine_special: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export const ProductFormDialog = ({ open, onOpenChange, product }: ProductFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!product;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      short_description: '',
      price: 0,
      original_price: undefined,
      image_url: '',
      category: '',
      featured: false,
      bestseller: false,
      valentine_special: false,
      is_active: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        title: product.title,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        original_price: product.original_price || undefined,
        image_url: product.image_url,
        category: product.category,
        featured: product.featured,
        bestseller: product.bestseller,
        valentine_special: product.valentine_special,
        is_active: product.is_active,
      });
      setCurrentFileUrl(product.file_url);
      setSelectedFile(null);
    } else {
      form.reset({
        title: '',
        slug: '',
        description: '',
        short_description: '',
        price: 0,
        original_price: undefined,
        image_url: '',
        category: '',
        featured: false,
        bestseller: false,
        valentine_special: false,
        is_active: true,
      });
      setCurrentFileUrl(null);
      setSelectedFile(null);
    }
  }, [product, form]);

  const uploadFile = async (file: File, productSlug: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productSlug}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('digital-products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    return fileName;
  };

  const deleteFile = async (filePath: string) => {
    const { error } = await supabase.storage
      .from('digital-products')
      .remove([filePath]);
    if (error) console.error('Failed to delete old file:', error);
  };

  const createMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      let fileUrl: string | null = null;
      
      if (selectedFile) {
        setIsUploading(true);
        try {
          fileUrl = await uploadFile(selectedFile, values.slug);
        } finally {
          setIsUploading(false);
        }
      }

      const { error } = await supabase.from('products').insert([{
        title: values.title,
        slug: values.slug,
        description: values.description,
        short_description: values.short_description,
        price: values.price,
        original_price: values.original_price || null,
        image_url: values.image_url,
        category: values.category,
        featured: values.featured,
        bestseller: values.bestseller,
        valentine_special: values.valentine_special,
        is_active: values.is_active,
        file_url: fileUrl,
        rating: 0,
        reviews: 0,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product created successfully' });
      onOpenChange(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create product', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) return;
      
      let fileUrl: string | null = currentFileUrl;
      
      if (selectedFile) {
        setIsUploading(true);
        try {
          // Delete old file if exists
          if (currentFileUrl) {
            await deleteFile(currentFileUrl);
          }
          fileUrl = await uploadFile(selectedFile, values.slug);
        } finally {
          setIsUploading(false);
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          ...values,
          original_price: values.original_price || null,
          file_url: fileUrl,
        })
        .eq('id', product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: 'Product updated successfully' });
      onOpenChange(false);
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update product', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (values: ProductFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeCurrentFile = async () => {
    if (currentFileUrl && product) {
      try {
        await deleteFile(currentFileUrl);
        await supabase
          .from('products')
          .update({ file_url: null })
          .eq('id', product.id);
        setCurrentFileUrl(null);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        toast({ title: 'File removed successfully' });
      } catch (error) {
        toast({ title: 'Failed to remove file', variant: 'destructive' });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Product title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="product-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="short_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description for cards" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed product description" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="299" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="original_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="499" 
                        {...field} 
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Love Letters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Digital Product File Upload */}
            <div className="space-y-2">
              <FormLabel>Digital Product File</FormLabel>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                {currentFileUrl && !selectedFile ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">File uploaded</span>
                      <span className="text-xs text-muted-foreground">({currentFileUrl})</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeCurrentFile}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : selectedFile ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeSelectedFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">Click to upload file</span>
                    <span className="text-xs text-muted-foreground">PDF, ZIP, or any digital file</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.zip,.rar,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp3,.mp4,.png,.jpg,.jpeg"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Upload the digital product file that customers will download after purchase.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Featured</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bestseller"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Bestseller</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="valentine_special"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Valentine Special</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="romantic" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isEditing ? (
                  'Update Product'
                ) : (
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
