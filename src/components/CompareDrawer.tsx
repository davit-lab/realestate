import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, BedDouble, Maximize2, MapPin, Check, Minus } from 'lucide-react';
import { Listing } from '../types';

interface CompareDrawerProps {
  listings: Listing[];
  currency: 'GEL' | 'USD';
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onViewDetail: (id: string) => void;
}

export default function CompareDrawer({
  listings,
  currency,
  isOpen,
  onClose,
  onRemove,
  onClear,
  onViewDetail,
}: CompareDrawerProps) {
  const sym = currency === 'GEL' ? '₾' : '$';

  const specs = [
    { label: 'ფასი', key: 'price', icon: null },
    { label: 'ფართი', key: 'area', icon: <Maximize2 size={12} /> },
    { label: 'ოთახები', key: 'rooms', icon: <BedDouble size={12} /> },
    { label: 'საძინებლები', key: 'beds', icon: <BedDouble size={12} /> },
    { label: 'ქალაქი', key: 'city', icon: <MapPin size={12} /> },
    { label: 'უბანი', key: 'district', icon: <MapPin size={12} /> },
    { label: 'მდგომარეობა', key: 'condition', icon: null },
    { label: 'სტატუსი', key: 'status', icon: null },
  ];

  const getValue = (listing: Listing, key: string) => {
    switch (key) {
      case 'price':
        const p = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
        return `${p.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${sym}`;
      case 'area':
        return `${listing.area} მ²`;
      case 'rooms':
        return listing.rooms;
      case 'beds':
        return String(listing.beds);
      default:
        return (listing as any)[key] ?? '—';
    }
  };

  const getPricePerSqm = (listing: Listing) => {
    const p = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
    return Math.round(p / listing.area).toLocaleString('en-US');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[95] bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Scale size={16} className="text-ss-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">შედარება</h3>
                  <p className="text-[11px] text-gray-400">{listings.length} განცხადება</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {listings.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-[12px] text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    გასუფთავება
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {listings.length === 0 ? (
                <div className="text-center py-12">
                  <Scale size={32} className="mx-auto text-gray-200 dark:text-gray-700 mb-3" />
                  <p className="text-sm text-gray-400">აირჩიეთ განცხადებები შესადარებლად</p>
                </div>
              ) : listings.length === 1 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-400">აირჩიეთ მინიმუმ 2 განცხადება შესადარებლად</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 w-32">პარამეტრი</th>
                        {listings.map(l => (
                          <th key={l.id} className="text-left pb-3 min-w-[160px]">
                            <div className="relative group">
                              <div
                                className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2 cursor-pointer"
                                onClick={() => onViewDetail(l.id)}
                              >
                                <img src={l.image} alt={l.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <button
                                onClick={() => onRemove(l.id)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <X size={10} />
                              </button>
                              <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug cursor-pointer hover:text-ss-primary transition-colors"
                                onClick={() => onViewDetail(l.id)}>
                                {l.title}
                              </p>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {specs.map(spec => (
                        <tr key={spec.key} className="border-t border-gray-100 dark:border-gray-800">
                          <td className="py-3 text-[12px] font-medium text-gray-500 flex items-center gap-1.5">
                            {spec.icon}
                            {spec.label}
                          </td>
                          {listings.map(l => (
                            <td key={l.id} className="py-3 text-[13px] text-gray-800 dark:text-gray-200 font-semibold">
                              {getValue(l, spec.key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-t border-gray-100 dark:border-gray-800">
                        <td className="py-3 text-[12px] font-medium text-gray-500">ფასი/მ²</td>
                        {listings.map(l => (
                          <td key={l.id} className="py-3 text-[13px] text-ss-primary font-bold">
                            {getPricePerSqm(l)} {sym}/მ²
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
