import React from 'react';
import { Heart, MapPin, BedDouble, Maximize2, Eye, Building2 } from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getAgentDiscountedPrice } from '../utils/pricing';

interface ListingCardProps {
  key?: string;
  listing: Listing;
  isFavorited: boolean;
  onFavoriteToggle: (id: string, e: React.MouseEvent) => void;
  currency: 'GEL' | 'USD';
  onCardClick: () => void;
  exchangeRate: number;
}

const TYPE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  sale:       { label: 'იყიდება',   bg: 'bg-violet-600/90',  text: 'text-white' },
  rent:       { label: 'ქირავდება', bg: 'bg-emerald-600/90', text: 'text-white' },
  daily_rent: { label: 'დღიურად',   bg: 'bg-sky-500/90',     text: 'text-white' },
  mortgage:   { label: 'იპოთეკა',   bg: 'bg-sky-700/90',     text: 'text-white' },
  pledge:     { label: 'გირავდება', bg: 'bg-amber-600/90',   text: 'text-white' },
};

export default function ListingCard({
  listing,
  isFavorited,
  onFavoriteToggle,
  currency,
  onCardClick,
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
  const isPro = listing.vipStatus === 'super_vip';
  const isTop = listing.vipStatus === 'vip+';
  const isAgentDiscount = profile?.is_agent && price !== basePrice;

  return (
    <article
      onClick={onCardClick}
      className={`group bg-white rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-xl
        ${isPro ? 'shadow-md shadow-amber-100 ring-1 ring-amber-300' : isTop ? 'shadow-md shadow-violet-100 ring-1 ring-violet-200' : 'shadow-sm border border-gray-200 hover:border-gray-300'}`}
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 shrink-0">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm tracking-wide ${typeInfo.bg} ${typeInfo.text}`}>
            {typeInfo.label}
          </span>
        </div>

        {/* VIP badge */}
        {(isPro || isTop) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest shadow-sm ${
              isPro ? 'bg-amber-400 text-gray-900' : 'bg-violet-600 text-white'
            }`}>
              {isPro ? '⭐ VIP' : '🔷 TOP'}
            </span>
          </div>
        )}

        {/* Favorite button */}
        <div className="absolute top-3 right-3">
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

        {/* Price overlay at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="text-white font-black text-[22px] leading-none drop-shadow-md">
              {formatted}<span className="text-[16px] ml-0.5">{sym}</span>
            </span>
            <p className="text-white/70 text-[11px] font-medium mt-0.5">{sym}{perSqm}/მ²</p>
          </div>
          {isAgentDiscount && (
            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-500 text-white shadow-sm">-50%</span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 pt-3.5 pb-3 flex flex-col gap-2 flex-1">
        {/* Title */}
        <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-1">
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
        <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
            <BedDouble size={13} className="text-gray-400" />
            {listing.rooms} ოთ.
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
            <Maximize2 size={13} className="text-gray-400" />
            {listing.area} მ²
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
            <Eye size={11} className="text-gray-300" />
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
    </article>
  );
}
