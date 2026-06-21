'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToLiveSermon, type TranslationSegment } from '@/services/realtime/liveSync';
import { TextToSpeechService } from '@/services/speech/TextToSpeechService';

type FontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Theme = 'dark' | 'blue' | 'sepia' | 'light';

const THEME_CLASSES: Record<Theme, string> = {
  dark: 'bg-slate-950 text-slate-100',
  blue: 'bg-blue-950 text-blue-50',
  sepia: 'bg-amber-50 text-amber-950',
  light: 'bg-white text-gray-900',
};

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
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

export default function Home() {
  const [segments, setSegments] = useState<TranslationSegment[]>([]);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [theme, setTheme] = useState<Theme>('dark');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  const ttsRef = useRef<TextToSpeechService>(new TextToSpeechService());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevSegmentsLengthRef = useRef(0);
  const hasReceivedSegmentRef = useRef(false);

  // Subscribe to live sermon on mount; unsubscribe on unmount
  useEffect(() => {
    const unsubscribe = subscribeToLiveSermon((segment: TranslationSegment) => {
      setSegments((prev) => [...prev, segment]);

      if (!hasReceivedSegmentRef.current) {
        hasReceivedSegmentRef.current = true;
        setConnected(true);
        setShowGreeting(true);
        setTimeout(() => setShowGreeting(false), 5000);
      }
    });

    return unsubscribe;
  }, []);

  // Clean up TTS on unmount
  useEffect(() => {
    return () => {
      ttsRef.current.setEnabled(false);
    };
  }, []);

  // TTS: speak new segments when enabled
  useEffect(() => {
    if (ttsEnabled && segments.length > prevSegmentsLengthRef.current) {
      const newSegments = segments.slice(prevSegmentsLengthRef.current);
      for (const seg of newSegments) {
        ttsRef.current.speak(seg.translated_text);
      }
    }
    prevSegmentsLengthRef.current = segments.length;
  }, [segments, ttsEnabled]);

  // Auto-scroll to bottom on new segments when auto-scroll is active
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [segments, autoScroll]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    if (isAtBottom) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
      setShowGreeting(false);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    setAutoScroll(true);
  }, []);

  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => {
      const next = !prev;
      ttsRef.current.setEnabled(next);
      return next;
    });
  }, []);

  const dismissGreeting = useCallback(() => {
    setShowGreeting(false);
  }, []);

  const themeClass = THEME_CLASSES[theme];
  const fontSizeClass = FONT_SIZE_CLASSES[fontSize];

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${themeClass} ${fontSizeClass}`}>
      {/* Keyframes for segment entry animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Header control bar ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Live status dot */}
          <div className="flex items-center gap-2" aria-label={connected ? 'Connected' : 'Disconnected'}>
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                connected
                  ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              LIVE
            </span>
          </div>
          {/* Sermon title */}
          <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
            Live Translation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS toggle (headphone icon) */}
          <button
            onClick={toggleTts}
            className={`p-2 rounded-lg transition-colors ${
              ttsEnabled
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
            title={ttsEnabled ? 'Disable TTS' : 'Enable TTS'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          </button>

          {/* Settings gear icon */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Open settings"
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {segments.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-500"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <p className="text-lg font-medium text-slate-400">
                Waiting for the sermon to begin...
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Live translation will appear here automatically
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Late-join greeting ── */}
            {showGreeting && (
              <div className="px-4 pt-3 pb-1 flex-shrink-0">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-4 py-3 text-sm text-indigo-300 relative">
                  <p className="font-medium">Live Translation Active</p>
                  <p className="text-indigo-400/80 text-xs mt-0.5">
                    Text will scroll as the speaker talks.
                  </p>
                  <button
                    onClick={dismissGreeting}
                    className="absolute top-2 right-2 p-0.5 rounded text-indigo-400/60 hover:text-indigo-300 transition-colors"
                    aria-label="Dismiss greeting"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* ── Scrollable segment feed ── */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth"
            >
              {segments.map((seg, idx) => (
                <div
                  key={seg.sequence_number}
                  className={`bg-slate-900/80 rounded-lg px-4 py-3 border border-slate-800/50 animate-[fadeInUp_0.3s_ease-out] ${
                    idx === segments.length - 1 ? 'border-indigo-500/20' : ''
                  }`}
                >
                  <p className="text-slate-200 leading-relaxed">
                    {seg.translated_text}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-600">
                      {new Date(seg.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-slate-700">
                      #{seg.sequence_number}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Floating "Scroll to bottom" button ── */}
            {!autoScroll && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <button
                  onClick={scrollToBottom}
                  className="pointer-events-auto bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center gap-2"
                  aria-label="Scroll to bottom"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Scroll to bottom
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Settings drawer overlay ── */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSettingsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Settings drawer ── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          settingsOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Settings"
        aria-hidden={!settingsOpen}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-slate-100">Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Font size selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Font Size
            </label>
            <div className="flex gap-2">
              {(Object.keys(FONT_SIZE_CLASSES) as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors ${
                    fontSize === size
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:bg-slate-700 hover:text-slate-300'
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
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEME_CLASSES) as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                    theme === t
                      ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900'
                      : 'border border-slate-700/50'
                  } ${THEME_CLASSES[t]} ${
                    t === 'light' ? 'border-slate-200' : ''
                  }`}
                  aria-label={`Theme ${THEME_LABELS[t]}`}
                  aria-pressed={theme === t}
                >
                  <div
                    className={`w-4 h-4 rounded-full border ${
                      t === 'dark'
                        ? 'bg-slate-950 border-slate-700'
                        : t === 'blue'
                          ? 'bg-blue-950 border-blue-800'
                          : t === 'sepia'
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-slate-200'
                    }`}
                  />
                  <span>{THEME_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
