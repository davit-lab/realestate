import React from 'react';

export function CardSkeleton() {
 return (
 <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
  <div className="aspect-[16/10] shimmer" />
  <div className="px-4 pt-3 pb-2.5 space-y-2">
  <div className="h-5 shimmer rounded w-3/5" />
  <div className="h-3.5 shimmer rounded w-full" />
  <div className="h-3.5 shimmer rounded w-2/3" />
  </div>
  <div className="px-4 py-2.5 border-t border-gray-50 flex items-center gap-3">
  <div className="h-3 shimmer rounded w-12" />
  <div className="h-3 shimmer rounded w-12" />
  <div className="ml-auto h-3 shimmer rounded w-14" />
  </div>
 </div>
 );
}

export function DetailSkeleton() {
 return (
 <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
  <div className="h-5 shimmer rounded w-32" />
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <div className="lg:col-span-8 space-y-6">
   <div className="aspect-[16/9] shimmer rounded-2xl" />
   <div className="grid grid-cols-5 gap-1.5">
   {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="aspect-[4/3] shimmer rounded-xl" />
   ))}
   </div>
   <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
   <div className="h-4 shimmer rounded w-1/3" />
   <div className="h-3 shimmer rounded w-full" />
   <div className="h-3 shimmer rounded w-5/6" />
   <div className="h-3 shimmer rounded w-4/5" />
   </div>
  </div>
  <div className="lg:col-span-4 space-y-4">
   <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
   <div className="h-6 shimmer rounded w-2/3" />
   <div className="h-4 shimmer rounded w-1/2" />
   <div className="h-10 shimmer rounded-xl w-full" />
   </div>
  </div>
  </div>
 </div>
 );
}

export function StatsSkeleton() {
 return (
 <div className="bg-white border-b border-gray-200 ">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
  <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 ">
   {Array.from({ length: 4 }).map((_, i) => (
   <div key={i} className="px-5 py-3.5 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg shimmer shrink-0" />
    <div className="flex-1 space-y-1.5">
    <div className="h-2.5 shimmer rounded w-20" />
    <div className="h-4 shimmer rounded w-16" />
    </div>
   </div>
   ))}
  </div>
  </div>
 </div>
 );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
  {Array.from({ length: count }).map((_, i) => (
  <CardSkeleton key={i} />
  ))}
 </div>
 );
}
