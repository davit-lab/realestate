import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BedDouble,
  Maximize2,
  Eye,
  ArrowRight,
  Heart,
  Scale,
  Check,
  User,
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getAgentDiscountedPrice } from '../utils/pricing';
import LazyImage from './LazyImage';

interface QuickViewModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetail: (id: string) => void;
  currency: 'GEL' | 'USD';
  isFavorited: boolean;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
  isCompareSelected?: boolean;
  onCompareToggle?: (id: string, e: React.MouseEvent) => void;
}

const TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  sale: { label: 'იყიდება', bg: 'bg-violet-100', text: 'text-violet-700' },
  rent: { label: 'ქირავდება', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  daily_rent: { label: 'დღიურად', bg: 'bg-sky-100', text: 'text-sky-700' },
  mortgage: { label: 'იპოთეკა', bg: 'bg-sky-100', text: 'text-sky-700' },
  pledge: { label: 'გირავდება', bg: 'bg-amber-100', text: 'text-amber-700' },
};

export default function QuickViewModal({
  listing,
  isOpen,
  onClose,
  onViewDetail,
  currency,
  isFavorited,
  onFavoriteToggle,
  isCompareSelected,
  onCompareToggle,
}: QuickViewModalProps) {
  const { profile } = useAuth();
  const [imgIndex, setImgIndex] = useState(0);

  const images = listing?.images?.length ? listing.images : [listing?.image || ''];

  useEffect(() => {
    if (isOpen) setImgIndex(0);
  }, [isOpen, listing?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1));
      if (e.key === 'ArrowRight') setImgIndex((i) => (i + 1) % images.length);
    };
    if (isOpen) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, images.length, onClose]);

  const nextImg = useCallback(() => setImgIndex((i) => (i + 1) % images.length), [images.length]);
  const prevImg = useCallback(() => setImgIndex((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);

  if (!listing) return null;

  const basePrice = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
  const price = getAgentDiscountedPrice(basePrice, profile);
  const formatted = price >= 1_000_000
    ? `${(price / 1_000_000).toFixed(1)}M`
    : price >= 1_000
    ? `${Math.round(price / 1_000)}K`
    : price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const sym = currency === 'GEL' ? '₾' : '$';
  const perSqm = Math.round(price / listing.area).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const typeInfo = TYPE_LABELS[listing.type] ?? { label: listing.type, bg: 'bg-gray-100', text: 'text-gray-700' };
  const isPremium = listing.vipStatus === 'premium';
  const isSuper = listing.vipStatus === 'super';
  const isBasic = listing.vipStatus === 'basic';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
          >
            {/* ── Left: image carousel ── */}
            <div className="relative w-full md:w-[55%] aspect-[4/3] md:aspect-auto md:min-h-[360px] bg-gray-100 shrink-0">
              <LazyImage
                src={images[imgIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
                placeholderColor="#e5e7eb"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Prev/Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute top-3 left-3 bg-black/50 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
                {imgIndex + 1} / {images.length}
              </div>

              {/* Dot indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`block rounded-full transition-all ${
                        i === imgIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: info ── */}
            <div className="flex-1 flex flex-col p-5 md:p-6 min-w-0 overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="text-[16px] font-bold text-gray-900 leading-snug">
                  {listing.title}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black text-gray-900">{formatted}</span>
                <span className="text-lg font-bold text-ss-primary">{sym}</span>
              </div>
              <div className="text-[12px] text-gray-500 mb-3">
                {sym}{perSqm}/მ² · {listing.area} მ²
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${typeInfo.bg} ${typeInfo.text}`}>
                  {typeInfo.label}
                </span>
                {(isPremium || isSuper || isBasic) && (
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg text-white ${
                      isPremium ? 'bg-amber-600' : isSuper ? 'bg-emerald-600' : 'bg-slate-500'
                    }`}
                  >
                    {isPremium ? 'PREMIUM' : isSuper ? 'SUPER' : 'BASIC'}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  {listing.viewCount || 0} ნახვა
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-4">
                <MapPin size={13} className="text-gray-400 shrink-0" />
                <span className="line-clamp-1">{listing.district}, {listing.city}</span>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {listing.property_type !== 'land' && (
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                    <BedDouble size={15} className="text-gray-400 mx-auto mb-1" />
                    <span className="text-[11px] text-gray-500 block">ოთახები</span>
                    <span className="text-[13px] font-bold text-gray-900">{listing.rooms}</span>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                  <Maximize2 size={15} className="text-gray-400 mx-auto mb-1" />
                  <span className="text-[11px] text-gray-500 block">ფართი</span>
                  <span className="text-[13px] font-bold text-gray-900">{listing.area} მ²</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                  <User size={15} className="text-gray-400 mx-auto mb-1" />
                  <span className="text-[11px] text-gray-500 block">აგენტი</span>
                  <span className="text-[13px] font-bold text-gray-900 truncate">{listing.author.name}</span>
                </div>
              </div>

              {/* Description preview */}
              <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-3 mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                {listing.descriptions.ka}
              </p>

              {/* Actions */}
              <div className="mt-auto flex items-center gap-2">
                <button
                  onClick={() => onViewDetail(listing.id)}
                  className="flex-1 bg-ss-primary hover:bg-ss-primary-dark text-white text-sm font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Eye size={14} />
                  ნახვა
                </button>
                {onCompareToggle && (
                  <button
                    onClick={(e) => onCompareToggle(listing.id, e)}
                    title={isCompareSelected ? 'შედარებიდან ამოშლა' : 'შედარებაში დამატება'}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      isCompareSelected
                        ? 'bg-ss-primary text-white border-ss-primary'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-ss-primary hover:border-ss-primary'
                    }`}
                  >
                    {isCompareSelected ? <Check size={14} /> : <Scale size={14} />}
                  </button>
                )}
                <button
                  onClick={(e) => onFavoriteToggle(listing.id, e)}
                  title="რჩეულებში"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    isFavorited
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:text-rose-500 hover:border-rose-300'
                  }`}
                >
                  <Heart size={14} className={isFavorited ? 'fill-white stroke-white' : ''} />
                </button>
                <button
                  onClick={onClose}
                  className="px-4 h-10 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  დახურვა
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
