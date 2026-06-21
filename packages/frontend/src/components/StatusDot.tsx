'use client';

import React from 'react';

interface StatusDotProps {
  state: 'live' | 'idle' | 'error';
  label?: string;
  className?: string;
  ariaLabel?: string;
  labelClassName?: string;
}

const STATE_CLASSES: Record<string, string> = {
  live: 'bg-status-live animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]',
  idle: 'bg-surface-muted',
  error: 'bg-status-error',
};

export function StatusDot({
  state,
  label,
  className = '',
  ariaLabel,
  labelClassName,
}: StatusDotProps) {
  const dot = (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${STATE_CLASSES[state] ?? STATE_CLASSES.idle} ${className}`}
    />
  );

  const ariaLabelValue = ariaLabel ?? state;

  if (label) {
    return (
      <div className="flex items-center gap-2" aria-label={ariaLabelValue}>
        {dot}
        <span className={`text-xs font-medium uppercase tracking-wider ${labelClassName || 'text-text-secondary'}`}>
          {label}
        </span>
      </div>
    );
  }

  return <div aria-label={ariaLabelValue}>{dot}</div>;
}
