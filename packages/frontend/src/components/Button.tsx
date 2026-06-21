'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    'bg-accent-strong hover:bg-accent text-white shadow-lg shadow-accent-strong/20',
  secondary:
    'bg-surface-tertiary border border-surface-muted/50 text-text-secondary hover:bg-surface-muted hover:text-text-primary',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
};

const SIZE_CLASSES: Record<string, string> = {
  sm: 'px-2 py-1 rounded-lg text-xs',
  md: 'px-4 py-2 rounded-lg text-sm',
  lg: 'px-6 py-3 rounded-xl text-base font-semibold',
};

const ICON_ONLY_SIZE_CLASSES: Record<string, string> = {
  sm: 'p-1.5 rounded-lg',
  md: 'p-2 rounded-lg',
  lg: 'p-3 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isIconOnly = !children && (iconLeft != null || iconRight != null);

  const baseClasses =
    'inline-flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer select-none';

  const variantClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;
  const sizeClasses = isIconOnly
    ? ICON_ONLY_SIZE_CLASSES[size] ?? ICON_ONLY_SIZE_CLASSES.md
    : SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...rest}
    >
      {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
}
