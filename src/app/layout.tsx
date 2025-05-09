import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/layout/Header'; // Import Header

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PixelPlanner',
  description: '¡Planifica tu día, al estilo pixel!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'antialiased font-sans'
        )}
      >
        <Header />
        <main vaul-drawer-wrapper="" className="min-h-[calc(100vh-58px)] bg-background"> {/* Adjusted for header height approx 56px + 2px border */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}

