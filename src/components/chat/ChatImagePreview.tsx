import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';

interface ChatImagePreviewProps {
  src: string;
  alt?: string;
  maxWidth?: number;
}

export default function ChatImagePreview({ src, alt = 'Image', maxWidth = 240 }: ChatImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div
        className="relative group cursor-pointer overflow-hidden rounded-xl mt-1"
        style={{ maxWidth }}
        onClick={() => setOpen(true)}
      >
        {!loaded && (
          <div className="w-full h-32 bg-gray-100 animate-pulse rounded-xl" />
        )}
        <img
          src={src}
          alt={alt}
          className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02] ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          onLoad={() => setLoaded(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
          <ZoomIn size={18} className="text-white drop-shadow-md" />
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              src={src}
              alt={alt}
              className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
