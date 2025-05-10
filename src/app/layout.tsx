import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CARA IELTS Dashboard',
  description: 'IELTS preparation dashboard',
  icons: {
    icon: '/ci-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}