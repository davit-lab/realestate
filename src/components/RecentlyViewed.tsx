import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, ChevronRight } from 'lucide-react';
import { RecentViewItem } from '../hooks/useRecentViews';

interface RecentlyViewedProps {
 items: RecentViewItem[];
 currency: 'GEL' | 'USD';
 onSelect: (id: string) => void;
 onRemove: (id: string) => void;
 onClear: () => void;
}

export default function RecentlyViewed({ items, currency, onSelect, onRemove, onClear }: RecentlyViewedProps) {
 if (items.length === 0) return null;

 const sym = currency === 'GEL' ? '₾' : '$';

 return (
 <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
  <div className="flex items-center gap-2">
   <Clock size={14} className="text-ss-primary" />
   <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">ბოლოს ნანახი</span>
  </div>
  <button
   onClick={onClear}
   className="text-[11px] text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
  >
   გასუფთავება
  </button>
  </div>
  <div className="p-2 space-y-1">
  <AnimatePresence>
   {items.slice(0, 5).map(item => {
   const price = currency === 'GEL' ? item.priceLari : item.priceUsd;
   const formatted = price >= 1000000
    ? `${(price / 1000000).toFixed(1)}M`
    : price >= 1000
    ? `${Math.round(price / 1000)}K`
    : price.toLocaleString('en-US', { maximumFractionDigits: 0 });

   return (
    <motion.div
    key={item.id}
    layout
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 :bg-gray-800 transition-colors cursor-pointer"
    onClick={() => onSelect(item.id)}
    >
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
     <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </div>
    <div className="flex-1 min-w-0">
     <p className="text-[12px] font-semibold text-gray-900 truncate leading-tight">{item.title}</p>
     <p className="text-[11px] text-gray-400 ">{item.city} · {formatted}{sym}</p>
    </div>
    <div className="flex items-center gap-1">
     <ChevronRight size={14} className="text-gray-300 group-hover:text-ss-primary transition-colors" />
     <button
     onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
     className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all cursor-pointer p-1"
     >
     <X size={12} />
     </button>
    </div>
    </motion.div>
   );
   })}
  </AnimatePresence>
  </div>
 </div>
 );
}
