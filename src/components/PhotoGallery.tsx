import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface PhotoGalleryProps {
 images: string[];
 initialIndex?: number;
 title?: string;
 onClose: () => void;
}

export default function PhotoGallery({ images, initialIndex = 0, title, onClose }: PhotoGalleryProps) {
 const [current, setCurrent] = useState(initialIndex);
 const [zoomed, setZoomed]  = useState(false);
 const [thumbsVisible, setThumbsVisible] = useState(true);

 const prev = useCallback(() => {
 setCurrent(i => (i === 0 ? images.length - 1 : i - 1));
 setZoomed(false);
 }, [images.length]);

 const next = useCallback(() => {
 setCurrent(i => (i === images.length - 1 ? 0 : i + 1));
 setZoomed(false);
 }, [images.length]);

 useEffect(() => {
 const handler = (e: KeyboardEvent) => {
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'Escape')  onClose();
  if (e.key === 'f' || e.key === 'F') setZoomed(z => !z);
 };
 document.addEventListener('keydown', handler);
 document.body.style.overflow = 'hidden';
 return () => {
  document.removeEventListener('keydown', handler);
  document.body.style.overflow = '';
 };
 }, [prev, next, onClose]);

 const hasPrev = images.length > 1;
 const hasNext = images.length > 1;

 return (
 <div
  className="fixed inset-0 z-[300] bg-[#0D0D0F] flex flex-col"
  onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
 >
  {/* ── Top bar ── */}
  <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0 bg-[#0D0D0F]">
  <div className="flex items-center gap-3">
   <span className="text-white font-semibold text-sm truncate max-w-xs">{title}</span>
   <span className="text-[11px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded font-medium">
   {current + 1} / {images.length}
   </span>
  </div>
  <div className="flex items-center gap-1.5">
   <button
   onClick={() => setZoomed(z => !z)}
   title="გადიდება (F)"
   className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
    zoomed ? 'bg-ss-primary text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
   }`}
   >
   {zoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
   </button>
   <button
   onClick={() => setThumbsVisible(v => !v)}
   title="ესკიზები"
   className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
   >
   <Maximize size={15} />
   </button>
   <div className="w-px h-5 bg-gray-700 mx-1" />
   <button
   onClick={onClose}
   className="w-8 h-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center transition-colors"
   >
   <X size={15} />
   </button>
  </div>
  </div>

  {/* ── Main image ── */}
  <div className="flex-1 relative flex items-center justify-center min-h-0 overflow-hidden">
  {/* Prev */}
  {hasPrev && (
   <button
   onClick={prev}
   className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
   >
   <ChevronLeft size={20} />
   </button>
  )}

  {/* Image */}
  <div
   className={`w-full h-full flex items-center justify-center px-16 py-4 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
   onClick={() => setZoomed(z => !z)}
  >
   <img
   key={current}
   src={images[current]}
   alt={`ფოტო ${current + 1}`}
   referrerPolicy="no-referrer"
   className={`max-h-full max-w-full object-contain select-none transition-transform duration-300 ${
    zoomed ? 'scale-[1.8]' : 'scale-100'
   }`}
   draggable={false}
   />
  </div>

  {/* Next */}
  {hasNext && (
   <button
   onClick={next}
   className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
   >
   <ChevronRight size={20} />
   </button>
  )}

  {/* Keyboard hint */}
  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[11px] text-gray-600">
   <span>← → ნავიგაცია</span>
   <span>·</span>
   <span>F გადიდება</span>
   <span>·</span>
   <span>Esc დახურვა</span>
  </div>
  </div>

  {/* ── Thumbnails ── */}
  {thumbsVisible && images.length > 1 && (
  <div className="shrink-0 border-t border-white/10 bg-[#111113] px-4 py-3">
   <div className="flex gap-2 overflow-x-auto justify-center">
   {images.map((img, i) => (
    <button
    key={i}
    onClick={() => { setCurrent(i); setZoomed(false); }}
    className={`shrink-0 w-[72px] h-12 rounded-md overflow-hidden border-2 transition-all duration-150 ${
     i === current
     ? 'border-ss-primary opacity-100 scale-[1.04]'
     : 'border-transparent opacity-40 hover:opacity-70'
    }`}
    >
    <img
     src={img}
     alt=""
     className="w-full h-full object-cover"
     referrerPolicy="no-referrer"
     draggable={false}
    />
    </button>
   ))}
   </div>
  </div>
  )}
 </div>
 );
}
