interface SegmentCardProps {
  translatedText: string;
  className?: string;
}

export function SegmentCard({ translatedText, className = '' }: SegmentCardProps) {
  return (
    <p className={`animate-fade-in-up text-text-primary ${className}`.trim()}>
      {translatedText}
    </p>
  );
}
