import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speechcraft - Speaker Console',
  description: 'Stream raw voice audio for real-time Indonesian-to-English translation',
};

export default function SpeakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
