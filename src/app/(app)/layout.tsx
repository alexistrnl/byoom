'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';

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
    { path: '/dashboard', label: 'Accueil', emoji: '🏠' },
    { path: '/my-plants', label: 'Mon Jardin', emoji: '🌿' },
    { path: '/identify', label: 'Identifier', emoji: '🔍', isCentral: true },
    { path: '/diagnose', label: 'Diag', emoji: '🔬' },
    { path: '/byoombase', label: 'Byoombase', emoji: '📖' },
  ];

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{
        backgroundColor: '#F5F0E8',
      }}
    >
      {/* Contenu avec padding-bottom pour la bottom nav */}
      <main className="page-scroll flex-1" style={{ 
        height: 'calc(100vh - 80px)',
        paddingBottom: '80px'
      }}>
        {children}
      </main>

      {/* Bottom Navigation Bar */}
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

          // Bouton central surélevé
          if (item.isCentral) {
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center justify-center rounded-full transition-all active:scale-95"
                style={{
                  width: '52px',
                  height: '52px',
                  backgroundColor: '#5B8C5A',
                  marginTop: '-20px',
                  boxShadow: '0 4px 15px rgba(91, 140, 90, 0.4)',
                  fontSize: '22px',
                }}
                aria-label={item.label}
              >
                {item.emoji}
              </Link>
            );
          }

          // Onglets normaux
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
              <span
                style={{
                  fontSize: '24px',
                  opacity: active ? 1 : 0.4,
                }}
              >
                {item.emoji}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
