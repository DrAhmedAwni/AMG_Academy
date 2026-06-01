import type { Metadata } from 'next';
import '@fontsource/hanken-grotesk/index.css';
import '@fontsource/inter/index.css';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AMG Academy',
  description: 'Dental education, events, and course platform for AMG Academy.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
