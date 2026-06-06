'use client';

import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  as?: 'button' | 'a';
  href?: string;
}

const variantClasses = {
  primary: [
    'bg-[var(--accent-cyan)] text-[var(--text-inverse)] font-semibold',
    'hover:brightness-110 active:brightness-95',
    'shadow-[0_0_24px_var(--accent-cyan-dim)]',
    'hover:shadow-[0_0_36px_oklch(74%_0.17_200/0.3)]',
  ].join(' '),
  secondary: [
    'border border-[var(--border-default)] text-[var(--text-primary)] font-medium',
    'hover:bg-[var(--bg-raised)] hover:border-[var(--border-strong)]',
  ].join(' '),
  ghost: [
    'text-[var(--text-secondary)] font-medium',
    'hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]',
  ].join(' '),
  amber: [
    'bg-[var(--accent-amber)] text-[var(--text-inverse)] font-semibold',
    'hover:brightness-110 active:brightness-95',
    'shadow-[0_0_24px_var(--accent-amber-dim)]',
    'hover:shadow-[0_0_36px_oklch(78%_0.18_55/0.3)]',
  ].join(' '),
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-4 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  onClick,
  disabled,
  type,
  style,
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={style}
      className={[
        'inline-flex items-center gap-2 transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
