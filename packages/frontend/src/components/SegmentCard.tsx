interface SegmentCardProps {
  translatedText: string;
  className?: string;
}

export function SegmentCard({ translatedText, className = '' }: SegmentCardProps) {
  return (
    <div
      className={`animate-fade-in-up bg-surface-secondary/80 border border-surface-border/50 border-l-4 border-l-accent rounded-xl p-4 shadow-sm text-text-primary transition-all ${className}`.trim()}
    >
      <p>{translatedText}</p>
    </div>
  );
}
