import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Home, DollarSign, MapPin, Calendar } from 'lucide-react';
import { Listing } from '../types';

interface MarketStatsProps {
 listings: Listing[];
 currency: 'GEL' | 'USD';
}

export default function MarketStats({ listings, currency }: MarketStatsProps) {
 const sym = currency === 'GEL' ? '₾' : '$';

 const stats = useMemo(() => {
 if (listings.length === 0) return null;

 const prices = listings.map(l => currency === 'GEL' ? l.priceLari : l.priceUsd);
 const sqmPrices = listings.map(l =>
  Math.round((currency === 'GEL' ? l.priceLari : l.priceUsd) / l.area)
 );

 const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
 const avgSqm = Math.round(sqmPrices.reduce((a, b) => a + b, 0) / sqmPrices.length);
 const minPrice = Math.min(...prices);
 const maxPrice = Math.max(...prices);

 // City frequency
 const cityCount: Record<string, number> = {};
 listings.forEach(l => { cityCount[l.city] = (cityCount[l.city] ?? 0) + 1; });
 const topCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

 // Sale vs rent ratio
 const forSale = listings.filter(l => l.type === 'sale').length;
 const forRent = listings.filter(l => l.type === 'rent').length;

 // VIP count
 const vipCount = listings.filter(l => l.vipStatus !== 'standard').length;

 const fmt = (n: number) =>
  n >= 1000000
  ? `${(n / 1000000).toFixed(1)}M`
  : n >= 1000
   ? `${Math.round(n / 1000)}K`
   : `${n}`;

 return { avgPrice, avgSqm, minPrice, maxPrice, topCity, forSale, forRent, vipCount, fmt };
 }, [listings, currency]);

 if (!stats) return null;

 const items = [
 {
  icon: <Home size={15} />,
  label: 'სულ განცხადება',
  value: listings.length.toLocaleString(),
  sub: `${stats.forSale} იყიდება · ${stats.forRent} ქირა`,
  up: true,
 },
 {
  icon: <DollarSign size={15} />,
  label: 'საშ. ფასი',
  value: `${stats.fmt(stats.avgPrice)} ${sym}`,
  sub: `${stats.fmt(stats.minPrice)} — ${stats.fmt(stats.maxPrice)}`,
  up: true,
 },
 {
  icon: <TrendingUp size={15} />,
  label: 'საშ. ფასი/მ²',
  value: `${stats.avgSqm.toLocaleString()} ${sym}`,
  sub: 'ყველა ობიექტის მიხედვით',
  up: true,
 },
 {
  icon: <MapPin size={15} />,
  label: 'პოპულ. ქალაქი',
  value: stats.topCity,
  sub: 'ყველაზე მეტი განცხადება',
  up: null,
 },
 ];

 return (
 <div className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
  <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
   {items.map((item, i) => (
   <div key={i} className="px-5 py-3.5 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
    {item.icon}
    </div>
    <div className="min-w-0">
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">
     {item.label}
    </p>
    <div className="flex items-baseline gap-1.5">
     <span className="text-[15px] font-black text-gray-900 leading-none">
     {item.value}
     </span>
     {item.up !== null && (
     <span className={`text-[10px] font-bold flex items-center gap-0.5 ${item.up ? 'text-emerald-600' : 'text-rose-500'}`}>
      {item.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      +2.4%
     </span>
     )}
    </div>
    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.sub}</p>
    </div>
   </div>
   ))}
  </div>
  </div>
 </div>
 );
}
