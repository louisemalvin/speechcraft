'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAudioCapture } from '../../hooks/useAudioCapture';
import { StatusDot } from '@/components/StatusDot';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PinGate } from '@/components/PinGate';

export default function SpeakerPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(false);
  const sermonIdRef = useRef(Date.now().toString());

  const { isListening, start, stop, latestTranscribedText, latestTranslatedText, error } =
    useAudioCapture(sermonIdRef.current);

  useEffect(() => {
    setIsMounted(true);
    const pin = sessionStorage.getItem('speaker_pin') || localStorage.getItem('speaker_pin');
    if (pin) {
      sessionStorage.setItem('speaker_pin', pin);
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return setPinError('PIN cannot be empty.');
    sessionStorage.setItem('speaker_pin', pinInput);
    if (rememberDevice) localStorage.setItem('speaker_pin', pinInput);
    setIsAuthenticated(true); setPinError(null);
  };

  const handleLock = () => {
    if (isListening) stop();
    sessionStorage.removeItem('speaker_pin'); localStorage.removeItem('speaker_pin');
    setIsAuthenticated(false); setPinInput('');
  };

  if (!isMounted) return (
    <div className="min-h-screen bg-surface-primary text-text-primary flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-text-secondary font-medium">Loading console...</span>
      </div>
    </div>
  );

  if (!isAuthenticated) return <PinGate pinInput={pinInput} pinError={pinError} rememberDevice={rememberDevice} onPinInputChange={setPinInput} onRememberDeviceChange={setRememberDevice} onSubmit={handlePinSubmit} />;

  const gradientClasses = isListening
    ? 'bg-gradient-to-br from-status-error to-status-error-dark hover:from-status-error-bright hover:to-status-error shadow-status-error-dark/20'
    : 'bg-gradient-to-br from-accent-strong to-accent-deep hover:from-accent-hover hover:to-accent-strong shadow-accent-strong/20';

  return (
    <main className="min-h-screen bg-surface-primary text-text-primary flex flex-col justify-between p-6 md:p-8 font-sans">
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Icon name="Broadcast" className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Speaker Console</h1>
            <p className="text-xs text-text-secondary">Sermon Translation System</p>
          </div>
        </div>
        <div className="bg-surface-secondary border border-surface-border rounded-full px-3.5 py-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide">
          <StatusDot state={isListening ? 'live' : 'idle'} label={isListening ? 'LIVE BROADCAST' : 'READY TO START'} labelClassName={isListening ? 'text-status-live-bright' : 'text-text-secondary'} />
        </div>
      </header>

      <section className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center mb-8">
          {isListening && <div className="absolute inset-0 rounded-full bg-status-error/20 border-2 border-status-error/30 animate-pulse-ring" />}
          <Button
            variant="primary"
            size="lg"
            iconLeft={<Icon name={isListening ? 'Stop' : 'Play'} className="!w-10 !h-10 mb-1" />}
            onClick={isListening ? stop : start}
            className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer text-center select-none shadow-2xl !p-0 text-white ${gradientClasses}`}
          >
            <span className="font-bold tracking-wider text-base uppercase">{isListening ? 'Stop Broadcast' : 'Start Broadcast'}</span>
          </Button>
        </div>

        <div className="flex items-end justify-center gap-1.5 h-12 w-32 my-4" aria-label="Volume visualizer">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className={`w-2 rounded-full transition-all duration-300 ${isListening ? `bg-accent animate-wave-${idx}` : 'bg-surface-tertiary h-2'}`} />
          ))}
        </div>
      </section>

      <section className="w-full max-w-2xl mx-auto space-y-6">
        {error && (
          <Card variant="error" padding="lg" className="flex items-start gap-3 shadow-lg shadow-status-error-dark/20">
            <Icon name="ErrorCircle" className="w-5 h-5 text-status-error-bright shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold block mb-0.5">Broadcast Error</span>
              <p className="opacity-90">{error}</p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-secondary/50 border border-surface-border/80 rounded-xl p-5 shadow-inner">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-surface-muted" />
              Speech Transcription (Indonesian)
            </h3>
            <p className={`text-sm leading-relaxed min-h-[96px] max-h-[144px] overflow-y-auto ${latestTranscribedText ? 'text-text-primary font-mono' : 'text-text-secondary italic'}`}>
              {latestTranscribedText || 'Waiting for speech...'}
            </p>
          </div>

          <div className="bg-accent/15 border border-accent-muted/35 rounded-xl p-5 shadow-inner">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Translation Output (English)
            </h3>
            <p className={`text-sm leading-relaxed min-h-[96px] max-h-[144px] overflow-y-auto ${latestTranslatedText ? 'text-text-primary font-sans' : 'text-accent-hover/50 italic'}`}>
              {latestTranslatedText || 'Translation will appear here...'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" size="md" iconLeft={<Icon name="Lock" className="w-4 h-4" />} onClick={handleLock}>Lock Console</Button>
        </div>
      </section>
    </main>
  );
}
