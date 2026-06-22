'use client';

interface BroadcastButtonProps {
  isListening: boolean;
  volume: number;     // integer, 0–100
  onToggle: () => void;
}

export function BroadcastButton({ isListening, volume, onToggle }: BroadcastButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isListening ? 'Stop broadcast' : 'Start broadcast'}
      className="relative w-48 h-48 rounded-full flex items-center justify-center
                 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent
                 transition-all duration-300 cursor-pointer select-none
                 active:scale-[0.97]"
    >
      {isListening && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring bg-accent/20"
            style={{ transform: `scale(${1 + volume / 200})` }}
          />
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring bg-accent/10"
            style={{
              animationDelay: '0.5s',
              transform: `scale(${1 + volume / 100})`,
            }}
          />
        </>
      )}

      <span
        className={`relative z-10 w-full h-full rounded-full flex items-center justify-center
                    text-lg font-semibold transition-all duration-300
                    ${isListening
                      ? 'bg-linear-to-br from-accent-strong to-accent shadow-lg shadow-accent-strong/40 text-[#FAFAF9]'
                      : 'bg-surface-muted text-text-primary'
                    }`}
      >
        {isListening ? 'Stop' : 'Broadcast'}
      </span>
    </button>
  );
}
