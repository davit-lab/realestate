import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
 const [visible, setVisible] = useState(false);

 useEffect(() => {
 const onScroll = () => setVisible(window.scrollY > 500);
 window.addEventListener('scroll', onScroll, { passive: true });
 return () => window.removeEventListener('scroll', onScroll);
 }, []);

 return (
 <AnimatePresence>
  {visible && (
  <motion.button
   initial={{ opacity: 0, scale: 0.8, y: 10 }}
   animate={{ opacity: 1, scale: 1, y: 0 }}
   exit={{ opacity: 0, scale: 0.8, y: 10 }}
   transition={{ type: 'spring', stiffness: 400, damping: 25 }}
   onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
   className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-2xl bg-white border border-gray-200 shadow-md text-gray-700 hover:text-ss-primary hover:border-ss-primary/40 flex items-center justify-center transition-colors cursor-pointer"
   aria-label="ზემოთ"
  >
   <ArrowUp size={18} strokeWidth={2.5} />
  </motion.button>
  )}
 </AnimatePresence>
 );
}
