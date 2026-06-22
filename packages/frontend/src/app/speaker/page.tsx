'use client';

import { useState, useEffect } from 'react';
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
  const [asrProvider, setAsrProvider] = useState<'deepgram' | 'webspeech'>('deepgram');

  useEffect(() => {
    const saved = localStorage.getItem('asr_provider');
    if (saved === 'deepgram' || saved === 'webspeech') {
      setAsrProvider(saved);
    }
  }, []);

  const handleAsrChange = (provider: 'deepgram' | 'webspeech') => {
    if (isListening) return;
    setAsrProvider(provider);
    localStorage.setItem('asr_provider', provider);
  };

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

      {/* ASR Provider Settings */}
      <div className="w-full max-w-md mb-8">
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Speech-to-Text Provider
        </label>
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            disabled={isListening}
            onClick={() => handleAsrChange('deepgram')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              asrProvider === 'deepgram'
                ? 'bg-accent/10 border-accent/80 text-text-primary shadow-sm font-sans'
                : 'bg-surface-secondary/60 border-surface-border/50 text-text-secondary hover:bg-surface-secondary/90 hover:border-surface-border/80 font-sans'
            } ${isListening ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                asrProvider === 'deepgram' ? 'border-accent' : 'border-surface-border'
              }`}>
                {asrProvider === 'deepgram' && (
                  <div className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div>
                <span className="font-semibold text-sm block text-text-primary">Deepgram (Premium)</span>
                <span className="text-xs text-text-muted">Cloud-powered transcription. High accuracy.</span>
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={isListening}
            onClick={() => handleAsrChange('webspeech')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              asrProvider === 'webspeech'
                ? 'bg-accent/10 border-accent/80 text-text-primary shadow-sm font-sans'
                : 'bg-surface-secondary/60 border-surface-border/50 text-text-secondary hover:bg-surface-secondary/90 hover:border-surface-border/80 font-sans'
            } ${isListening ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                asrProvider === 'webspeech' ? 'border-accent' : 'border-surface-border'
              }`}>
                {asrProvider === 'webspeech' && (
                  <div className="w-2 h-2 rounded-full bg-accent" />
                )}
              </div>
              <div>
                <span className="font-semibold text-sm block text-text-primary">Web Speech API (Free)</span>
                <span className="text-xs text-text-muted block mt-0.5">
                  Web Speech API is best supported on Chrome/Edge
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="pt-4">
        <Button variant="secondary" size="md" iconLeft={<Icon name="Lock" className="w-4 h-4" />} onClick={() => handleLock(onLock)}>Lock Console</Button>
      </div>
    </main>
  );
}
