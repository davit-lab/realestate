import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Search } from 'lucide-react';
import { SearchHistoryItem } from '../hooks/useSearchHistory';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (item: SearchHistoryItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function SearchHistory({ history, onSelect, onRemove, onClear }: SearchHistoryProps) {
  if (history.length === 0) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return 'ახლახან';
    if (diff < 60) return `${diff} წთ`;
    if (diff < 1440) return `${Math.floor(diff / 60)} სთ`;
    return `${Math.floor(diff / 1440)} დღე`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={14} className="text-ss-primary" />
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ბოლოს ძიება</span>
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
          {history.map(item => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onClick={() => onSelect(item)}
              className="w-full group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left cursor-pointer"
            >
              <Search size={13} className="text-gray-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.query || 'ფილტრი'}
                </p>
                <p className="text-[10px] text-gray-400">{formatTime(item.timestamp)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all cursor-pointer p-1"
              >
                <X size={12} />
              </button>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
