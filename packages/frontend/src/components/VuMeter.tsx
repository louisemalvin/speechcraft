interface VuMeterProps {
  volume: number;    // integer, 0–100
  isActive: boolean;
}

export function VuMeter({ volume, isActive }: VuMeterProps) {
  return (
    <div
      role="meter"
      aria-valuenow={volume}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Volume level"
      className="w-full h-3 rounded-full bg-surface-tertiary overflow-hidden"
    >
      <div
        className={`h-full rounded-full bg-linear-to-r from-accent-strong to-status-live transition-all duration-75 ${
          isActive ? '' : 'opacity-30'
        }`}
        style={{ width: `${isActive ? volume : 0}%` }}
      />
    </div>
  );
}
