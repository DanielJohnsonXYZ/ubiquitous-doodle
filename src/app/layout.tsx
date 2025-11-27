import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Relationship Intelligence',
  description: 'AI-powered client relationship monitoring and insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
