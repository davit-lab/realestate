import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-lg text-gray-700 hover:text-ss-primary hover:border-ss-primary flex items-center justify-center transition-all cursor-pointer"
      aria-label="ზემოთ"
    >
      <ArrowUp size={16} strokeWidth={2.5} />
    </button>
  );
}
