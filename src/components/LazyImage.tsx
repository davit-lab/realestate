import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
 src: string;
 alt: string;
 className?: string;
 placeholderColor?: string;
}

export default function LazyImage({
 src,
 alt,
 className = '',
 placeholderColor = '#e5e7eb',
}: LazyImageProps) {
 const [loaded, setLoaded] = useState(false);
 const [inView, setInView] = useState(false);
 const imgRef = useRef<HTMLImageElement>(null);

 useEffect(() => {
 const observer = new IntersectionObserver(
  ([entry]) => {
  if (entry.isIntersecting) {
   setInView(true);
   observer.disconnect();
  }
  },
  { rootMargin: '200px' }
 );

 if (imgRef.current) observer.observe(imgRef.current);
 return () => observer.disconnect();
 }, []);

 return (
 <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={{ backgroundColor: placeholderColor }}>
  {inView && (
  <img
   src={src}
   alt={alt}
   className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
   onLoad={() => setLoaded(true)}
   referrerPolicy="no-referrer"
  />
  )}
 </div>
 );
}
