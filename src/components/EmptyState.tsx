import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, SearchX, Heart, MessageSquare, FolderOpen } from 'lucide-react';

type EmptyType = 'search' | 'favorites' | 'messages' | 'listings' | 'generic';

interface EmptyStateProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const config: Record<EmptyType, { icon: React.ReactNode; defaultTitle: string; defaultDesc: string }> = {
  search: {
    icon: <SearchX size={40} strokeWidth={1.5} />,
    defaultTitle: 'განცხადება ვერ მოიძებნა',
    defaultDesc: 'სცადეთ სხვა პარამეტრები ან გაასუფთავეთ ფილტრი',
  },
  favorites: {
    icon: <Heart size={40} strokeWidth={1.5} />,
    defaultTitle: 'რჩეულები ცარიელია',
    defaultDesc: 'მონიშნეთ განცხადებები გულის ხატულაზე მთავარ გვერდზე შესანახად',
  },
  messages: {
    icon: <MessageSquare size={40} strokeWidth={1.5} />,
    defaultTitle: 'შეტყობინებები ცარიელია',
    defaultDesc: 'თქვენი მიმოწერები აქ გამოჩნდება',
  },
  listings: {
    icon: <FolderOpen size={40} strokeWidth={1.5} />,
    defaultTitle: 'განცხადებები არ არის',
    defaultDesc: 'დაამატეთ პირველი განცხადება',
  },
  generic: {
    icon: <HelpCircle size={40} strokeWidth={1.5} />,
    defaultTitle: 'მონაცემები არ მოიძებნა',
    defaultDesc: 'სცადეთ მოგვიანებით',
  },
};

export default function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const c = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mx-auto mb-4">
        {c.icon}
      </div>
      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">{title ?? c.defaultTitle}</h4>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
        {description ?? c.defaultDesc}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="bg-ss-primary hover:bg-ss-primary-dark text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
