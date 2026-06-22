interface VuMeterProps {
  volume: number;    // integer, 0–100
  isActive: boolean;
  threshold?: number;
}

export function VuMeter({ volume, isActive, threshold }: VuMeterProps) {
  const isBelowThreshold = threshold !== undefined && volume < threshold;
  const barColorClass = isBelowThreshold
    ? 'bg-amber-500/60'
    : 'bg-linear-to-r from-accent-strong to-status-live';

  return (
    <div
      role="meter"
      aria-valuenow={volume}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Volume level"
      className="relative w-full h-3 rounded-full bg-surface-tertiary overflow-hidden"
    >
      <div
        className={`h-full rounded-full transition-all duration-75 ${barColorClass} ${
          isActive ? '' : 'opacity-30'
        }`}
        style={{ width: `${isActive ? volume : 0}%` }}
      />
      {threshold !== undefined && (
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-neutral-400 opacity-50 pointer-events-none"
          style={{ left: `${threshold}%` }}
        />
      )}
    </div>
  );
}
