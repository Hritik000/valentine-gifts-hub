import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDownloadProduct = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const downloadProduct = async (productId: string, orderId: string) => {
    setIsDownloading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('download-product', {
        body: { productId, orderId }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate download link');
      }

      if (!data?.downloadUrl) {
        throw new Error('No download URL received');
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download started',
        description: 'Your file is being downloaded.',
      });

      return true;
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadProduct, isDownloading };
};
