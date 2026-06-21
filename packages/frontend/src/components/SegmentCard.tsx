'use client';

import React from 'react';
import { Card } from './Card';
import { type TranslationSegment } from '@/services/realtime/liveSync';

interface SegmentCardProps {
  segment: TranslationSegment;
  isLatest: boolean;
  fontSizeClass: string;
}

export function SegmentCard({
  segment,
  isLatest,
  fontSizeClass,
}: SegmentCardProps) {
  return (
    <Card
      variant={isLatest ? 'accent' : 'default'}
      className="animate-fade-in-up"
    >
      <p className={`text-text-primary leading-relaxed ${fontSizeClass}`}>
        {segment.translated_text}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-muted">
          {new Date(segment.timestamp).toLocaleTimeString()}
        </span>
        <span className="text-xs text-text-muted">
          #{segment.sequence_number}
        </span>
      </div>
    </Card>
  );
}
