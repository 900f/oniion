import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'oniion.cc',
  description: 'Create your personalized bio page at oniion.cc',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}