'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Rango del scroll en el que se activa [entrada, salida] entre 0-1 */
  inputRange?: [number, number];
}

export default function ScrollReveal({
  children,
  className,
  inputRange = [0, 1],
}: ScrollRevealProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawOpacity = useTransform(scrollYProgress, inputRange, [0, 1]);
  const rawY = useTransform(scrollYProgress, inputRange, [40, 0]);

  const opacity = useSpring(rawOpacity, { stiffness: 100, damping: 30 });
  const y = useSpring(rawY, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} className={className} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
