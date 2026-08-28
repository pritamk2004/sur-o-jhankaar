'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, Radio as RadioIcon, Library, Heart, Lock, Music2 } from 'lucide-react';
import { clsx } from 'clsx';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Music Mood', href: '/mood', icon: Sparkles },
    { label: 'Radio', href: '/radio', icon: RadioIcon },
    { label: 'Your Library', href: '/library', icon: Library }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass-panel border-r border-theme-border z-30 p-5 select-none">
        {/* Brand Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-red-800 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                SUR O JHANKAAR
              </h1>
              <p className="text-[10px] tracking-widest uppercase text-theme-muted font-medium">
                Har Sur Mein Ek Kahaani
              </p>
            </div>
          </Link>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center space-x-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-theme-accent/15 text-theme-accent border border-theme-accent/30 shadow-glow font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className={clsx('w-5 h-5', isActive ? 'text-theme-accent' : 'text-zinc-400')} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 pb-2">
            <div className="h-[1px] bg-white/10 w-full mb-4" />
            <Link
              href="/library?tab=favorites"
              className="flex items-center space-x-3.5 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-pink-600 to-red-700 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span>Liked Songs</span>
            </Link>
          </div>
        </nav>

        {/* Footer Admin Entry */}
        <div className="pt-4 border-t border-white/10">
          <Link
            href="/admin/login"
            className="flex items-center space-x-2.5 px-3 py-2 text-xs text-zinc-500 hover:text-theme-accent transition-colors rounded-lg hover:bg-white/5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-theme-border z-40 px-3 py-2 flex items-center justify-around select-none">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors',
                isActive ? 'text-theme-accent font-semibold' : 'text-zinc-400 hover:text-white'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive && 'animate-pulse')} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
