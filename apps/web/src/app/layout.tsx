import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { PlayerProvider } from '../context/PlayerContext';
import { DynamicBackdrop } from '../components/themes/DynamicBackdrop';
import { Navigation } from '../components/layout/Navigation';
import { MiniPlayer } from '../components/player/MiniPlayer';
import { FullPlayerModal } from '../components/player/FullPlayerModal';

export const metadata: Metadata = {
  title: 'Sur o Jhankaar — Har Sur Mein Ek Kahaani',
  description: 'A cinematic, nostalgic Indian music & storytelling platform. Ad-free, no-login, pure melody.',
  manifest: '/manifest.json'
};

export const viewport: Viewport = {
  themeColor: '#1A0409'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#1A0409] text-[#FFF8EB]">
        <ThemeProvider>
          <PlayerProvider>
            <DynamicBackdrop />
            <div className="flex min-h-screen">
              <Navigation />
              <main className="flex-1 md:ml-64 pb-36 md:pb-28 min-h-screen">
                {children}
              </main>
            </div>
            <MiniPlayer />
            <FullPlayerModal />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
