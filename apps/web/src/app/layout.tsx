import type { Metadata } from 'next';
import { env } from '@nextjs-tpl/db/env';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: 'Next.js Template',
    template: '%s | Next.js Template',
  },
  description: 'A self-hosted, agent-friendly Next.js full-stack template',
  applicationName: 'Next.js Template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased"
        style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
