'use client';

import { useAudioCapture } from '../../hooks/useAudioCapture';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { PinGate } from '@/components/PinGate';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { usePinAuth } from '@/hooks/usePinAuth';
import { BroadcastButton } from '@/components/BroadcastButton';
import { VuMeter } from '@/components/VuMeter';
import { Card } from '@/components/Card';

export default function SpeakerPage() {
  const { isListening, start, stop, error, volume } = useAudioCapture();

  const {
    isMounted,
    isAuthenticated,
    pinInput,
    pinError,
    rememberDevice,
    setPinInput,
    setRememberDevice,
    handlePinSubmit,
    handleLock,
  } = usePinAuth();

  const onLock = () => {
    if (isListening) stop();
  };

  if (!isMounted) return <LoadingSpinner label="Loading console..." />;

  if (!isAuthenticated) return (
    <PinGate
      pinInput={pinInput}
      pinError={pinError}
      rememberDevice={rememberDevice}
      onPinInputChange={setPinInput}
      onRememberDeviceChange={setRememberDevice}
      onSubmit={handlePinSubmit}
    />
  );

  return (
    <main className="min-h-screen bg-surface-primary text-text-primary flex flex-col items-center justify-center p-6 md:p-8 font-sans">
      <div className="flex items-center justify-center mb-8">
        <BroadcastButton
          isListening={isListening}
          volume={volume}
          onToggle={isListening ? stop : start}
        />
      </div>

      {/* Horizontal VU Meter */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between items-center mb-1.5 text-xs text-text-secondary font-medium">
          <span className="flex items-center gap-1">
            <Icon name="Microphone" className={`w-3.5 h-3.5 ${isListening ? 'text-accent' : 'text-text-muted'}`} />
            <span>Input Level</span>
          </span>
          <span className="font-mono">{isListening ? volume : 0}%</span>
        </div>
        <VuMeter volume={isListening ? volume : 0} isActive={isListening} />
      </div>

      {error && (
        <Card
          variant="error"
          padding="lg"
          className="w-full max-w-md mb-6 flex items-start gap-3"
        >
          <div role="alert" className="flex items-start gap-3">
            <Icon name="ErrorCircle" className="w-5 h-5 text-status-error-bright shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold block mb-0.5 text-text-primary">Broadcast Error</span>
              <p className="text-text-secondary">{error}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="pt-4">
        <Button variant="secondary" size="md" iconLeft={<Icon name="Lock" className="w-4 h-4" />} onClick={() => handleLock(onLock)}>Lock Console</Button>
      </div>
    </main>
  );
}
