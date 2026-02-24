'use client';
import { useRouter } from 'next/navigation';
import { isPremium } from '@/lib/subscription';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';

interface PremiumGateProps {
  feature: string;
  description: string;
  children: React.ReactNode;
}

export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const { user } = usePocketBase();
  const router = useRouter();

  if (isPremium(user)) return <>{children}</>;

  return (
    <div style={{
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', opacity: 0.4 }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(245,240,232,0.85)',
        backdropFilter: 'blur(2px)',
        padding: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</p>
        <p style={{ 
          fontFamily: 'Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#52414C',
          marginBottom: '0.5rem'
        }}>{feature}</p>
        <p style={{ 
          color: '#596157', 
          fontSize: '0.85rem',
          marginBottom: '1rem'
        }}>{description}</p>
        <button
          onClick={() => router.push('/pricing')}
          style={{
            backgroundColor: '#5B8C5A',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Passer Premium 🌿
        </button>
      </div>
    </div>
  );
}
