import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Speechcraft - Debug Console',
  description: 'Live debug monitor for speech-to-text outputs and translations',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
