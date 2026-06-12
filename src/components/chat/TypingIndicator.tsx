import React from 'react';
import { motion } from 'motion/react';

interface TypingIndicatorProps {
 color?: 'purple' | 'gray' | 'emerald';
 size?: 'sm' | 'md';
}

const colorMap = {
 purple: 'bg-purple-400',
 gray: 'bg-gray-400',
 emerald: 'bg-emerald-400',
};

export default function TypingIndicator({ color = 'purple', size = 'md' }: TypingIndicatorProps) {
 const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
 const containerClass = size === 'sm'
 ? 'px-3 py-2 rounded-2xl rounded-tl-md'
 : 'px-4 py-3 rounded-[20px] rounded-tl-[6px]';

 return (
 <div className={`inline-flex items-center gap-1 bg-white/80 backdrop-blur-sm shadow-sm border border-white/60 ${containerClass}`}>
  {[0, 1, 2].map((i) => (
  <motion.span
   key={i}
   className={`${dotSize} rounded-full ${colorMap[color]}`}
   animate={{
   scale: [1, 1.4, 1],
   opacity: [0.5, 1, 0.5],
   }}
   transition={{
   duration: 1.2,
   repeat: Infinity,
   delay: i * 0.15,
   ease: 'easeInOut',
   }}
  />
  ))}
 </div>
 );
}
