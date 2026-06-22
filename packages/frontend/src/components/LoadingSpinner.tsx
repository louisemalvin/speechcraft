interface LoadingSpinnerProps {
  label: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-surface-primary text-text-primary flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-text-secondary font-medium">{label}</span>
      </div>
    </div>
  );
}
