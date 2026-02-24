'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { isPremium } from '@/lib/subscription';
import { HomeIcon, PlantIcon, SearchIcon, MicroscopeIcon, BookIcon } from '@/components/Icons';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = usePocketBase();

  // Protection : si l'utilisateur est authentifié et arrive sur login, rediriger vers dashboard
  useEffect(() => {
    if (user && pathname === '/login') {
      router.replace('/dashboard');
    }
  }, [user, pathname, router]);

  // Détection de la page active
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  // Navigation items
  const navItems = [
    { path: '/dashboard', label: 'Accueil', icon: HomeIcon },
    { path: '/my-plants', label: 'Mon Jardin', icon: PlantIcon },
    { path: '/identify', label: 'Identifier', icon: SearchIcon },
    { path: '/diagnose', label: 'Diag', icon: MicroscopeIcon },
    { path: '/byoombase', label: 'Byoombase', icon: BookIcon },
  ];

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: '#F5F0E8',
      }}
    >
      {/* Contenu avec padding-bottom pour la bottom nav (sauf admin) */}
      <main className="flex-1" style={{ 
        paddingBottom: pathname.startsWith('/admin') ? '0' : '80px'
      }}>
        {children}
      </main>

      {/* Badge Premium si pas premium (masqué sur admin) */}
      {user && !isPremium(user) && pathname !== '/pricing' && !pathname.startsWith('/admin') && (
        <Link
          href="/pricing"
          className="fixed top-4 right-4 z-50 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: '#5B8C5A',
            boxShadow: '0 4px 12px rgba(91, 140, 90, 0.3)',
          }}
        >
          ⭐ Premium
        </Link>
      )}

      {/* Bottom Navigation Bar - Masquée pour les pages admin */}
      {!pathname.startsWith('/admin') && (
        <nav
          className="bottom-nav fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around border-t bg-white"
          style={{
            minHeight: '80px',
            padding: '12px 1rem calc(12px + env(safe-area-inset-bottom))',
            borderTop: '1px solid rgba(82, 65, 76, 0.08)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center justify-center transition-all active:scale-95"
                style={{
                  padding: active ? '8px 16px' : '8px',
                  borderRadius: active ? '12px' : '0',
                  backgroundColor: active ? 'rgba(91, 140, 90, 0.12)' : 'transparent',
                }}
                aria-label={item.label}
              >
                <Icon
                  size={28}
                  color={active ? '#5B8C5A' : 'rgba(89, 97, 87, 0.4)'}
                />
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
