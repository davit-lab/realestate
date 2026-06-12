import React from 'react';
import { motion } from 'motion/react';

interface ScrollRevealProps {
 children: React.ReactNode;
 className?: string;
 delay?: number;
 direction?: 'up' | 'down' | 'left' | 'right';
 duration?: number;
}

export default function ScrollReveal({
 children,
 className = '',
 delay = 0,
 direction = 'up',
 duration = 0.5,
}: ScrollRevealProps) {
 const directions = {
 up: { y: 30, x: 0 },
 down: { y: -30, x: 0 },
 left: { y: 0, x: 30 },
 right: { y: 0, x: -30 },
 };

 const initial = {
 opacity: 0,
 ...directions[direction],
 };

 return (
 <motion.div
  className={className}
  initial={initial}
  whileInView={{ opacity: 1, x: 0, y: 0 }}
  viewport={{ once: true, margin: '-40px' }}
  transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
 >
  {children}
 </motion.div>
 );
}
