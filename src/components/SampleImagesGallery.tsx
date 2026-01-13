import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SampleImagesGalleryProps {
  images: string[];
  productTitle: string;
}

export const SampleImagesGallery = ({ images, productTitle }: SampleImagesGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  return (
    <>
      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold mb-4">Preview Images</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openLightbox(index)}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
            >
              <img
                src={image}
                alt={`${productTitle} preview ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative">
            <AnimatePresence mode="wait">
              {selectedIndex !== null && (
                <motion.img
                  key={selectedIndex}
                  src={images[selectedIndex]}
                  alt={`${productTitle} preview ${selectedIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
              )}
            </AnimatePresence>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
