import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface Point { date: string; price: number; }
interface Props { data: Point[]; currency: 'GEL' | 'USD'; }

export default function PriceHistoryChart({ data, currency }: Props) {
 const sym = currency === 'GEL' ? '₾' : '$';
 const [hovered, setHovered] = useState<number | null>(null);
 if (data.length < 2) return null;

 const prices = data.map(d => d.price);
 const min = Math.min(...prices);
 const max = Math.max(...prices);
 const range = max - min || 1;

 const W = 800, H = 180, PL = 50, PR = 20, PT = 16, PB = 32;
 const gW = W - PL - PR, gH = H - PT - PB;
 const xf = (i: number) => PL + (i / (data.length - 1)) * gW;
 const yf = (p: number) => PT + gH - ((p - min) / range) * gH;
 const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xf(i)} ${yf(d.price)}`).join(' ');
 const area = `${line} L ${xf(data.length - 1)} ${PT + gH} L ${PL} ${PT + gH} Z`;
 const yLabs = [min, (min + max) / 2, max];
 const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${Math.round(n)}`;

 return (
 <div className="bg-white rounded-2xl border border-gray-100 p-5">
  <div className="flex items-center justify-between mb-4">
  <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
   <TrendingUp size={14} className="text-emerald-600" />
   ფასის ისტორია
  </h4>
  <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">ბოლო 6 თვე</span>
  </div>
  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: '180px' }} onMouseLeave={() => setHovered(null)}>
  {yLabs.map((_, i) => (
   <line key={i} x1={PL} y1={PT + gH - (i / 2) * gH} x2={PL + gW} y2={PT + gH - (i / 2) * gH} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
  ))}
  {yLabs.map((v, i) => (
   <text key={i} x={PL - 6} y={PT + gH - (i / 2) * gH + 4} fontSize="9" fill="#9CA3AF" textAnchor="end">{fmt(v)}{sym}</text>
  ))}
  <path d={area} fill="#F3F4F6" />
  <path d={line} fill="none" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  {data.map((d, i) => {
   const x = xf(i), y = yf(d.price), hov = hovered === i;
   return (
   <g key={i}>
    <circle cx={x} cy={y} r={hov ? 5 : 3.5} fill="#fff" stroke="#18181B" strokeWidth={hov ? 2.5 : 2} style={{ cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={() => setHovered(i)} />
    {hov && (
    <g>
     <rect x={x - 50} y={y - 40} width="100" height="30" rx="6" fill="#18181B" />
     <text x={x} y={y - 22} fontSize="10" fill="white" textAnchor="middle" fontWeight="700">{fmt(d.price)}{sym}</text>
     <text x={x} y={y - 10} fontSize="9" fill="#9CA3AF" textAnchor="middle">{d.date}</text>
    </g>
    )}
   </g>
   );
  })}
  {data.map((d, i) => {
   if (data.length > 8 && i % 2 !== 0) return null;
   return <text key={i} x={xf(i)} y={H - 8} fontSize="9" fill="#9CA3AF" textAnchor="middle">{d.date}</text>;
  })}
  </svg>
 </div>
 );
}
