'use client';

import React from 'react';
import { Card } from './Card';
import { Icon } from './Icon';
import { Button } from './Button';

interface PinGateProps {
  pinInput: string;
  pinError: string | null;
  rememberDevice: boolean;
  onPinInputChange: (value: string) => void;
  onRememberDeviceChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PinGate({
  pinInput,
  pinError,
  rememberDevice,
  onPinInputChange,
  onRememberDeviceChange,
  onSubmit,
}: PinGateProps) {
  return (
    <main className="min-h-screen bg-surface-primary text-text-primary flex flex-col justify-center items-center px-4 py-12 font-sans select-none">
      <Card
        variant="default"
        className="w-full max-w-md bg-surface-secondary/60 border border-surface-border/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
            <Icon name="Lock" className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Speaker Console</h1>
          <p className="text-text-secondary text-sm">Please enter the speaker PIN to access the broadcast controls.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="pin-input" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Speaker PIN
            </label>
            <input
              id="pin-input"
              type="password"
              value={pinInput}
              onChange={(e) => onPinInputChange(e.target.value)}
              placeholder="••••••"
              className="w-full bg-surface-primary border border-surface-border rounded-xl px-4 py-3 text-center text-lg tracking-widest text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all font-mono"
            />
            {pinError && (
              <p className="text-status-error text-sm mt-2 font-medium flex items-center gap-1.5 justify-center">
                <Icon name="Warning" className="w-4 h-4 text-status-error" />
                {pinError}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => onRememberDeviceChange(e.target.checked)}
              className="w-4 h-4 rounded border-surface-border bg-surface-primary text-accent focus:ring-accent/30 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              Remember this device
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full rounded-xl"
            iconRight={<Icon name="UnlockArrow" className="w-4 h-4" />}
          >
            Unlock Console
          </Button>
        </form>
      </Card>
    </main>
  );
}
