'use client';

import { ReactNode, ComponentType } from 'react';

interface IconProps {
  name:
    | 'Microphone'
    | 'Play'
    | 'Stop'
    | 'Lock'
    | 'Settings'
    | 'Headphones'
    | 'Close'
    | 'UnlockArrow'
    | 'Broadcast'
    | 'Warning'
    | 'ErrorCircle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

function SvgWrapper({
  sizeClass,
  className,
  children,
  strokeWidth = 2,
}: {
  sizeClass: string;
  className?: string;
  children: ReactNode;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${sizeClass} ${className ?? ''}`.trim()}
    >
      {children}
    </svg>
  );
}

function MicrophoneIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </SvgWrapper>
  );
}

function PlayIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </SvgWrapper>
  );
}

function StopIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </SvgWrapper>
  );
}

function LockIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </SvgWrapper>
  );
}

function SettingsIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </SvgWrapper>
  );
}

function HeadphonesIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M19.07 4.93a10 10 0 010 14.14" />
      <path d="M15.54 8.46a5 5 0 010 7.07" />
    </SvgWrapper>
  );
}

function CloseIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </SvgWrapper>
  );
}

function UnlockArrowIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </SvgWrapper>
  );
}

function BroadcastIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </SvgWrapper>
  );
}

function WarningIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </SvgWrapper>
  );
}

function ErrorCircleIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </SvgWrapper>
  );
}

const ICON_MAP: Record<
  string,
  ComponentType<{ sizeClass: string; className?: string }>
> = {
  Microphone: MicrophoneIcon,
  Play: PlayIcon,
  Stop: StopIcon,
  Lock: LockIcon,
  Settings: SettingsIcon,
  Headphones: HeadphonesIcon,
  Close: CloseIcon,
  UnlockArrow: UnlockArrowIcon,
  Broadcast: BroadcastIcon,
  Warning: WarningIcon,
  ErrorCircle: ErrorCircleIcon,
};

export function Icon({
  name,
  size = 'md',
  className,
}: IconProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  const IconComponent = ICON_MAP[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent sizeClass={sizeClass} className={className} />;
}
