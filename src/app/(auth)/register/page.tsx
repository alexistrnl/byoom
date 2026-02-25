'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPocketBaseClient } from '@/lib/pocketbase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const pb = getPocketBaseClient();
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
        name: username, // Enregistrer le username dans le champ name
        points_total: 0,
        level: 1,
        badges: [],
        profile_public: true,
      });

      // Se connecter automatiquement après l'inscription
      await pb.collection('users').authWithPassword(email, password);
      
      // Attendre un peu pour que le contexte PocketBase détecte l'auth
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Utiliser window.location.href pour forcer un rechargement complet
      // Cela garantit que le contexte PocketBase sera réinitialisé avec la nouvelle auth
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  // Particules pour l'animation de fond
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: 20 + (i * 7) % 60,
    color: i % 3 === 0 ? '#5B8C5A' : i % 3 === 1 ? '#CFD186' : '#596157',
    left: (i * 23.7) % 100,
    top: (i * 31.3) % 100,
    duration: 15 + (i * 2.3) % 10,
    delay: (i * 1.7) % 5,
  }));

  const leaves = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: (i * 37.5) % 100,
    top: (i * 42.3) % 100,
    duration: 20 + (i * 3.1) % 10,
    delay: (i * 2.4) % 8,
    rotation: (i * 45) % 360,
  }));

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(to bottom right, rgba(168, 213, 162, 0.15), rgba(91, 140, 90, 0.2))',
      padding: '1rem'
    }}>
      {/* Arrière-plan animé */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0
      }}>
        {/* Particules flottantes */}
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            style={{
              position: 'absolute',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              borderRadius: '50%',
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              opacity: 0.2,
              animation: `float${particle.id % 3} ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        
        {/* Feuilles flottantes */}
        {leaves.map((leaf) => (
          <div
            key={`leaf-${leaf.id}`}
            style={{
              position: 'absolute',
              left: `${leaf.left}%`,
              top: `${leaf.top}%`,
              fontSize: '2rem',
              opacity: 0.1,
              animation: `floatLeaf${leaf.id % 2} ${leaf.duration}s ease-in-out infinite`,
              animationDelay: `${leaf.delay}s`,
              transform: `rotate(${leaf.rotation}deg)`,
            }}
          >
            🌿
          </div>
        ))}
      </div>

      {/* Carte principale */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '380px',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#52414C',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}>
          Inscription
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#52414C',
              marginBottom: '0.5rem',
            }}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#5B8C5A'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#52414C',
              marginBottom: '0.5rem',
            }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#5B8C5A'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#52414C',
              marginBottom: '0.5rem',
            }}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#5B8C5A'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#52414C',
              marginBottom: '0.5rem',
            }}>
              Confirmer le mot de passe
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#5B8C5A'}
              onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              borderRadius: '12px',
              backgroundColor: '#5B8C5A',
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#596157',
          marginTop: '1.5rem',
        }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{
            color: '#5B8C5A',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Se connecter
          </a>
        </p>
      </div>

      <style jsx>{`
        @keyframes float0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, -20px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, 30px) rotate(180deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(30px, -30px) rotate(90deg); }
          75% { transform: translate(-30px, 30px) rotate(270deg); }
        }
        @keyframes floatLeaf0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(15px, -25px) rotate(15deg); }
        }
        @keyframes floatLeaf1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-15px, 25px) rotate(-15deg); }
        }
      `}</style>
    </div>
  );
}
