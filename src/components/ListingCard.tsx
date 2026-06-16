import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Heart, MapPin, BedDouble, Maximize2, Eye, Building2, Scale, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getAgentDiscountedPrice } from '../utils/pricing';
import LazyImage from './LazyImage';

interface ListingCardProps {
 key?: string;
 listing: Listing;
 isFavorited: boolean;
 onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
 currency: 'GEL' | 'USD';
 onCardClick: () => void;
 exchangeRate: number;
 isCompareSelected?: boolean;
 onCompareToggle?: (id: string, e: React.MouseEvent) => void;
 viewMode?: 'grid' | 'list';
 onQuickView?: (id: string, e: React.MouseEvent) => void;
}

const TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
 sale:  { label: 'იყიდება', bg: 'bg-violet-600/90', text: 'text-white' },
 rent:  { label: 'ქირავდება', bg: 'bg-emerald-600/90', text: 'text-white' },
 daily_rent: { label: 'დღიურად', bg: 'bg-sky-500/90',  text: 'text-white' },
 mortgage: { label: 'იპოთეკა', bg: 'bg-sky-700/90',  text: 'text-white' },
 pledge:  { label: 'გირავდება', bg: 'bg-amber-600/90', text: 'text-white' },
};

export default function ListingCard({
 listing,
 isFavorited,
 onFavoriteToggle,
 currency,
 onCardClick,
 isCompareSelected,
 onCompareToggle,
 viewMode = 'grid',
 onQuickView,
}: ListingCardProps) {
 const { profile } = useAuth();
 const basePrice = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
 const price = getAgentDiscountedPrice(basePrice, profile);
 const formatted = price >= 1_000_000
 ? `${(price / 1_000_000).toFixed(1)}M`
 : price >= 1_000
 ? `${Math.round(price / 1_000)}K`
 : price.toLocaleString('en-US', { maximumFractionDigits: 0 });
 const perSqm = Math.round(price / listing.area).toLocaleString('en-US', { maximumFractionDigits: 0 });
 const sym = currency === 'GEL' ? '₾' : '$';
 const typeInfo = TYPE_LABELS[listing.type] ?? { label: listing.type, bg: 'bg-gray-700/90', text: 'text-white' };
 const isPremium = listing.vipStatus === 'premium';
 const isSuper = listing.vipStatus === 'super';
 const isBasic = listing.vipStatus === 'basic';
 const isAgentDiscount = profile?.is_agent && price !== basePrice;

 // Carousel state
 const images = listing.images?.length ? listing.images : [listing.image];
 const [hoverIndex, setHoverIndex] = useState(0);
 const [isHovered, setIsHovered] = useState(false);

 useEffect(() => {
  if (!isHovered || images.length <= 1) return;
  const interval = setInterval(() => {
   setHoverIndex((prev) => (prev + 1) % images.length);
  }, 2000);
  return () => clearInterval(interval);
 }, [isHovered, images.length]);

 const handlePrev = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  setHoverIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
 }, [images.length]);

 const handleNext = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  setHoverIndex((prev) => (prev + 1) % images.length);
 }, [images.length]);

 const currentImage = images[hoverIndex];

 // List view layout
 if (viewMode === 'list') {
  return (
   <motion.article
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    onClick={onCardClick}
    className={`group bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col sm:flex-row transition-all duration-300
      hover:-translate-y-0.5 hover:shadow-lg
      ${isPremium ? 'ring-2 ring-amber-400 shadow-sm' : isSuper ? 'ring-2 ring-emerald-400 shadow-sm' : isBasic ? 'ring-2 ring-slate-300 shadow-sm' : 'border border-gray-200 shadow-sm hover:border-violet-200'}`}
   >
    {/* Image side */}
    <div
     className="relative w-full sm:w-[240px] shrink-0 aspect-[4/3] sm:aspect-auto overflow-hidden bg-gray-100"
     onMouseEnter={() => setIsHovered(true)}
     onMouseLeave={() => { setIsHovered(false); setHoverIndex(0); }}
    >
     <LazyImage
      src={currentImage}
      alt={listing.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      placeholderColor="#e5e7eb"
     />
     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

     <div className="absolute top-2.5 left-2.5">
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm tracking-wide ${typeInfo.bg} ${typeInfo.text}`}>
       {typeInfo.label}
      </span>
     </div>

     {(isPremium || isSuper || isBasic) && (
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2">
       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest shadow-sm ${
        isPremium ? 'bg-amber-600 text-white' : isSuper ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
       }`}>
        {isPremium ? 'PREMIUM' : isSuper ? 'SUPER' : 'BASIC'}
       </span>
      </div>
     )}

     {isHovered && images.length > 1 && (
      <>
       <button
        onClick={handlePrev}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
       >
        <ChevronLeft size={12} />
       </button>
       <button
        onClick={handleNext}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
       >
        <ChevronRight size={12} />
       </button>
       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
        {images.map((_, i) => (
         <span
          key={i}
          className={`block rounded-full transition-all ${i === hoverIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
         />
        ))}
       </div>
      </>
     )}

     <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
      <span className="text-white font-black text-[18px] leading-none drop-shadow-md">
       {formatted}<span className="text-[13px] ml-0.5">{sym}</span>
      </span>
      {isAgentDiscount && (
       <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">-50%</span>
      )}
     </div>
    </div>

    {/* Content side */}
    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
     <div className="space-y-2">
      <h3 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-1">
       {listing.title}
      </h3>
      <div className="flex items-center gap-1.5">
       <MapPin size={12} className="text-gray-400 shrink-0" />
       <span className="text-[12px] text-gray-500 line-clamp-1">
        {listing.district}, {listing.city}
       </span>
      </div>
      <div className="flex items-center gap-3 pt-1">
       {listing.property_type !== 'land' && (
        <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
         <BedDouble size={13} className="text-gray-400" />
         {listing.rooms} ოთ.
        </span>
       )}
       <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
        <Maximize2 size={13} className="text-gray-400" />
        {listing.area} მ²
       </span>
       <span className="text-[12px] text-gray-500 font-medium">
        {sym}{perSqm}/მ²
       </span>
      </div>
     </div>

     <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
      <div className="flex items-center gap-2.5">
       {listing.author.avatar ? (
        <img src={listing.author.avatar} alt={listing.author.name}
         className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0" />
       ) : (
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
         <Building2 size={11} className="text-gray-400" />
        </div>
       )}
       <span className="text-[11px] text-gray-400 font-medium truncate">{listing.author.name}</span>
      </div>
      <div className="flex items-center gap-1.5">
       {onQuickView && (
        <button
         onClick={(e) => { e.stopPropagation(); onQuickView(listing.id, e); }}
         title="სწრაფი ნახვა"
         className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all bg-white border border-gray-200 text-gray-500 hover:text-ss-primary hover:border-ss-primary"
        >
         <Eye size={13} />
        </button>
       )}
       {onCompareToggle && (
        <button
         onClick={(e) => onCompareToggle(listing.id, e)}
         title={isCompareSelected ? 'შედარებიდან ამოშლა' : 'შედარებაში დამატება'}
         className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all border ${
          isCompareSelected
           ? 'bg-ss-primary text-white border-ss-primary'
           : 'bg-white text-gray-500 hover:text-ss-primary hover:border-ss-primary'
         }`}
        >
         {isCompareSelected ? <Check size={13} /> : <Scale size={13} />}
        </button>
       )}
       <button
        onClick={(e) => onFavoriteToggle(listing.id, e)}
        title="რჩეულებში"
        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all border ${
         isFavorited
          ? 'bg-rose-500 text-white border-rose-500'
          : 'bg-white text-gray-500 hover:text-rose-500 hover:border-rose-300'
        }`}
       >
        <Heart size={13} className={isFavorited ? 'fill-white stroke-white' : ''} />
       </button>
      </div>
     </div>
    </div>
   </motion.article>
  );
 }

 return (
 <motion.article
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
  onClick={onCardClick}
  className={`group bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300
  hover:-translate-y-0.5 hover:shadow-lg
  ${isPremium ? 'ring-2 ring-amber-400 shadow-sm' : isSuper ? 'ring-2 ring-emerald-400 shadow-sm' : isBasic ? 'ring-2 ring-slate-300 shadow-sm' : 'border border-gray-200 shadow-sm hover:border-violet-200'}`}
 >
  {/* ── Image ── */}
  <div
   className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 shrink-0"
   onMouseEnter={() => setIsHovered(true)}
   onMouseLeave={() => { setIsHovered(false); setHoverIndex(0); }}
  >
  <LazyImage
   src={currentImage}
   alt={listing.title}
   className="w-full h-full transition-transform duration-700 group-hover:scale-105"
   placeholderColor="#e5e7eb"
  />

  {/* Subtle top gradient for badge readability */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

  {/* Type badge */}
  <div className="absolute top-3 left-3">
   <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm tracking-wide ${typeInfo.bg} ${typeInfo.text}`}>
   {typeInfo.label}
   </span>
  </div>

  {/* Package badge */}
  {(isPremium || isSuper || isBasic) && (
   <div className="absolute top-3 left-1/2 -translate-x-1/2">
   <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest shadow-sm ${
    isPremium ? 'bg-amber-600 text-white' : isSuper ? 'bg-emerald-600 text-white' : 'bg-slate-500 text-white'
   }`}>
    {isPremium ? 'PREMIUM' : isSuper ? 'SUPER' : 'BASIC'}
   </span>
   </div>
  )}

  {/* Action buttons */}
  <div className="absolute top-3 right-3 flex items-center gap-1.5">
   {onQuickView && (
   <button
    onClick={(e) => { e.stopPropagation(); onQuickView(listing.id, e); }}
    title="სწრაფი ნახვა"
    className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-ss-primary"
   >
    <Eye size={13} />
   </button>
   )}
   {onCompareToggle && (
   <button
    onClick={(e) => onCompareToggle(listing.id, e)}
    title={isCompareSelected ? 'შედარებიდან ამოშლა' : 'შედარებაში დამატება'}
    className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
    isCompareSelected
     ? 'bg-ss-primary text-white'
     : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-ss-primary'
    }`}
   >
    {isCompareSelected ? <Check size={13} /> : <Scale size={13} />}
   </button>
   )}
   <button
   onClick={(e) => onFavoriteToggle(listing.id, e)}
   title="რჩეულებში"
   className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
    isFavorited
    ? 'bg-rose-500 text-white'
    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-rose-500'
   }`}
   >
   <Heart size={13} className={isFavorited ? 'fill-white stroke-white' : ''} />
   </button>
  </div>

  {/* Carousel arrows (visible on hover) */}
  {isHovered && images.length > 1 && (
   <>
    <button
     onClick={handlePrev}
     className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
    >
     <ChevronLeft size={14} />
    </button>
    <button
     onClick={handleNext}
     className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
    >
     <ChevronRight size={14} />
    </button>
    {/* Dot indicators */}
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
     {images.map((_, i) => (
      <span
       key={i}
       className={`block rounded-full transition-all ${i === hoverIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
      />
     ))}
    </div>
   </>
  )}

  </div>

  {/* ── Body ── */}
  <div className="px-4 pt-3.5 pb-3 flex flex-col gap-2 flex-1">
  {/* Price */}
  <div className="flex items-baseline gap-1.5">
   <span className="text-[20px] font-black text-gray-900 leading-none">{formatted}</span>
   <span className="text-[14px] font-bold text-gray-700">{sym}</span>
   <span className="text-[11px] text-gray-400 font-medium ml-1">{sym}{perSqm}/მ²</span>
   {isAgentDiscount && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500 text-white ml-auto">-50%</span>}
  </div>
  {/* Title */}
  <h3 className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-1">
   {listing.title}
  </h3>

  {/* Location */}
  <div className="flex items-center gap-1.5">
   <MapPin size={12} className="text-gray-400 shrink-0" />
   <span className="text-[12px] text-gray-500 line-clamp-1">
   {listing.district}, {listing.city}
   </span>
  </div>

  {/* Stats row */}
  <div className="flex items-center gap-3 pt-1 border-t border-gray-100 ">
   {listing.property_type !== 'land' && (
   <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
   <BedDouble size={13} className="text-gray-400" />
   {listing.rooms} ოთ.
   </span>
   )}
   <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
   <Maximize2 size={13} className="text-gray-400" />
   {listing.area} მ²
   </span>
   <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
   <Eye size={11} className="text-gray-300 " />
   {listing.viewCount || 0}
   </span>
  </div>
  </div>

  {/* ── Footer: author ── */}
  <div className="px-4 pb-3.5 flex items-center gap-2.5">
  {listing.author.avatar ? (
   <img src={listing.author.avatar} alt={listing.author.name}
   className="w-6 h-6 rounded-full object-cover border border-gray-200 shrink-0" />
  ) : (
   <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
   <Building2 size={11} className="text-gray-400" />
   </div>
  )}
  <span className="text-[11px] text-gray-400 font-medium truncate flex-1">{listing.author.name}</span>
  <span className="text-[11px] text-gray-300 shrink-0">{listing.time}</span>
  </div>
 </motion.article>
 );
}
