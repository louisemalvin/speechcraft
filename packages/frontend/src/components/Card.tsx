'use client';

import React from 'react';

interface CardProps {
  variant?: 'default' | 'accent' | 'error';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  default: 'bg-surface-secondary/80 border border-surface-border/50',
  accent: 'bg-accent/10 border border-accent/20',
  error: 'bg-status-error-dark/50 border border-status-error',
};

const PADDING_CLASSES: Record<string, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'p-5',
};

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
}: CardProps) {
  const variantClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default;
  const paddingClasses = PADDING_CLASSES[padding] ?? PADDING_CLASSES.md;

  return (
    <div
      className={`rounded-lg ${variantClasses} ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  );
}
