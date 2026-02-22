'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = usePocketBase();

  // Pages où on ne veut pas afficher la navbar (dashboard a sa propre navigation)
  const hideNavbar = pathname === '/dashboard';


  // Déterminer le titre de la page
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/my-plants') return 'Mon Jardin';
    if (pathname.startsWith('/my-plants/')) return 'Ma Plante';
    if (pathname === '/identify') return 'Identifier';
    if (pathname === '/diagnose') return 'Diagnostic';
    if (pathname === '/pokedex') return 'Pokédex';
    return 'Byoom';
  };

  if (hideNavbar) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: '#F5F0E8',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Navbar avec bouton retour */}
      <nav
        className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b px-4 py-3"
        style={{
          backgroundColor: 'white',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Bouton retour */}
        <button
          onClick={() => {
            // Essayer de revenir en arrière
            router.back();
          }}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100 active:scale-95"
          style={{ color: '#52414C' }}
          aria-label="Retour"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Retour</span>
        </button>

        {/* Titre de la page */}
        <h1
          className="absolute left-1/2 -translate-x-1/2 font-serif text-base font-semibold"
          style={{ color: '#52414C' }}
        >
          {getPageTitle()}
        </h1>

        {/* Menu utilisateur / Dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center rounded-full p-2 transition-all hover:bg-gray-100 active:scale-95"
          style={{ color: '#52414C' }}
          aria-label="Dashboard"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
      </nav>

      {/* Contenu scrollable */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
        }}
      >
        {children}
      </main>
    </div>
  );
}
