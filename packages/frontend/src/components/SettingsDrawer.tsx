'use client';

import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

type FontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Theme = 'dark' | 'blue' | 'sepia' | 'light';

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const THEME_CLASSES: Record<Theme, string> = {
  dark: 'bg-surface-primary text-text-primary',
  blue: 'bg-theme-blue-bg text-theme-blue-text',
  sepia: 'bg-theme-sepia-bg text-theme-sepia-text',
  light: 'bg-theme-light-bg text-theme-light-text',
};

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: 'SM',
  md: 'MD',
  lg: 'LG',
  xl: 'XL',
  '2xl': '2XL',
};

const THEME_LABELS: Record<Theme, string> = {
  dark: 'Dark',
  blue: 'Midnight Blue',
  sepia: 'Sepia',
  light: 'Light',
};

export { type FontSize, type Theme, FONT_SIZE_CLASSES, THEME_CLASSES };

interface SettingsDrawerProps {
  open: boolean;
  fontSize: FontSize;
  theme: Theme;
  onFontSizeChange: (size: FontSize) => void;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
}

export function SettingsDrawer({
  open,
  fontSize,
  theme,
  onFontSizeChange,
  onThemeChange,
  onClose,
}: SettingsDrawerProps) {
  return (
    <>
      {/* ── Settings drawer overlay ── */}
      {open && (
        <div
          className="fixed inset-0 bg-overlay z-40 animate-fade-in-up"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Settings drawer ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-surface-secondary border-l border-surface-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Settings"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="text-base font-semibold text-text-primary">Settings</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!min-h-0 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
            aria-label="Close settings"
            iconLeft={<Icon name="Close" className="w-[18px] h-[18px]" />}
          />
        </div>

        <div className="p-5 space-y-6">
          {/* Font size selector */}
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              Font Size
            </label>
            <div className="flex gap-2">
              {(Object.keys(FONT_SIZE_CLASSES) as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    fontSize === size
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-surface-tertiary text-text-secondary border border-surface-muted/50 hover:bg-surface-muted hover:text-text-primary'
                  }`}
                  aria-label={`Font size ${FONT_SIZE_LABELS[size]}`}
                  aria-pressed={fontSize === size}
                >
                  {FONT_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div>
            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEME_CLASSES) as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => onThemeChange(t)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    theme === t
                      ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface-secondary'
                      : 'border border-surface-border/50'
                  } ${THEME_CLASSES[t]}`}
                  aria-label={`Theme ${THEME_LABELS[t]}`}
                  aria-pressed={theme === t}
                >
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      t === 'dark'
                        ? 'bg-surface-primary border-surface-muted'
                        : t === 'blue'
                          ? 'bg-theme-blue-bg border-theme-blue-text'
                          : t === 'sepia'
                            ? 'bg-theme-sepia-bg border-theme-sepia-text'
                            : 'bg-theme-light-bg border-theme-light-border'
                    }`}
                  />
                  <span>{THEME_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
