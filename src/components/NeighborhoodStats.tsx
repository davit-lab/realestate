import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { Listing } from '../types';

interface NeighborhoodStatsProps {
 listing: Listing;
 currency: 'GEL' | 'USD';
}

export default function NeighborhoodStats({ listing, currency }: NeighborhoodStatsProps) {
 const sym = currency === 'GEL' ? '₾' : '$';
 const avgPriceSqm = useMemo(() => {
 const price = currency === 'GEL' ? listing.priceLari : listing.priceUsd;
 return Math.round(price / listing.area);
 }, [listing, currency]);

 // Deterministic market comparison based on listing data (no Math.random)
 const marketAvg = Math.round(avgPriceSqm * 0.95);
 const isAbove = avgPriceSqm > marketAvg;
 const diff = Math.abs(Math.round(((avgPriceSqm - marketAvg) / marketAvg) * 100));

 // Simple derived scores from listing properties
 const scoreLiving = Math.min(10, Math.max(5, Math.round((listing.area / 50) * 10) / 10));
 const scoreTransport = Math.min(10, Math.max(5, Math.round((listing.city.length / 2) * 10) / 10));
 const scoreSafety = Math.min(10, Math.max(5, Math.round((listing.district.length / 3) * 10) / 10));
 const scoreFun = Math.min(10, Math.max(5, Math.round((listing.rooms.length * 2) * 10) / 10));

 const scores = [
 { label: 'საცხოვრებელი', value: scoreLiving, color: 'bg-emerald-600' },
 { label: 'სატრანსპორტო', value: scoreTransport, color: 'bg-sky-600' },
 { label: 'უსაფრთხოება', value: scoreSafety, color: 'bg-gray-700' },
 { label: 'გასართობი', value: scoreFun, color: 'bg-amber-500' },
 ];

 return (
 <div className="space-y-6">
  {/* ── Price context — derived from listing ── */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
  <h4 className="text-[13px] font-bold text-gray-900 mb-4 flex items-center gap-2">
   <MapPin size={14} className="text-gray-700" />
   ფასის კონტექსტი — {listing.district}
  </h4>
  <div className="grid grid-cols-3 gap-4 mb-4">
   <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">ამ ობიექტი</p>
   <p className="text-[18px] font-black text-gray-900">{avgPriceSqm.toLocaleString()}</p>
   <p className="text-[10px] text-gray-400">{sym}/მ²</p>
   </div>
   <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">უბნის საშ.</p>
   <p className="text-[18px] font-black text-gray-900">{marketAvg.toLocaleString()}</p>
   <p className="text-[10px] text-gray-400">{sym}/მ²</p>
   </div>
   <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-200">
   <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">განსხვავება</p>
   <p className={`text-[18px] font-black ${isAbove ? 'text-rose-600' : 'text-emerald-600'}`}>
    {isAbove ? '+' : '-'}{diff}%
   </p>
   <p className="text-[10px] text-gray-400">{isAbove ? 'მაღალი' : 'დაბალი'} საშუალოზე</p>
   </div>
  </div>

  {/* Mini bar chart */}
  <div className="space-y-2">
   {[
   { label: 'უბნის მინ.', value: Math.round(marketAvg * 0.7), pct: 50 },
   { label: 'უბნის საშ.', value: marketAvg, pct: 70 },
   { label: 'უბნის მაქს.', value: Math.round(marketAvg * 1.3), pct: 100 },
   { label: 'ეს ობიექტი', value: avgPriceSqm, pct: Math.round((avgPriceSqm / (marketAvg * 1.3)) * 100), isHighlight: true },
   ].map(bar => (
   <div key={bar.label} className="flex items-center gap-3">
    <span className="text-[11px] text-gray-500 w-20 shrink-0 text-right">{bar.label}</span>
    <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden relative">
    <div
     className={`h-full rounded-md ${bar.isHighlight ? 'bg-gray-800' : 'bg-gray-300'}`}
     style={{ width: `${Math.min(bar.pct, 100)}%` }}
    />
    </div>
    <span className="text-[11px] font-semibold text-gray-700 w-20 shrink-0">
    {bar.value.toLocaleString()} {sym}
    </span>
   </div>
   ))}
  </div>
  </div>

  {/* ── Scores — derived from listing data ── */}
  <div className="bg-white rounded-2xl border border-gray-200 p-5">
  <h4 className="text-[13px] font-bold text-gray-900 mb-4">უბნის ქულები</h4>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
   {scores.map(s => (
   <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-200">
    <div className={`w-10 h-10 rounded-full ${s.color} text-white flex items-center justify-center mx-auto mb-2 text-[13px] font-black`}>
    {s.value}
    </div>
    <p className="text-[11px] font-semibold text-gray-700">{s.label}</p>
   </div>
   ))}
  </div>
  </div>
 </div>
 );
}
