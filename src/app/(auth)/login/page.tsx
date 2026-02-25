'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const router = useRouter();
  const { login } = usePocketBase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      await new Promise(resolve => setTimeout(resolve, 200));
      window.location.href = '/dashboard';
    } catch (err: any) {
      // Gestion spécifique des erreurs d'authentification PocketBase
      let errorMessage = 'Erreur de connexion';
      
      // PocketBase retourne les erreurs dans err.response.data ou err.data
      const errorData = err?.response?.data || err?.data || {};
      const errorMessageRaw = errorData?.message || err?.message || '';
      
      // Détecter les erreurs d'authentification
      const lowerMessage = errorMessageRaw.toLowerCase();
      
      if (lowerMessage.includes('invalid login') || 
          lowerMessage.includes('failed to authenticate') ||
          lowerMessage.includes('incorrect') ||
          lowerMessage.includes('wrong password') ||
          lowerMessage.includes('wrong email') ||
          errorData?.code === 400) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (lowerMessage.includes('email')) {
        errorMessage = 'Adresse email invalide ou introuvable';
      } else if (lowerMessage.includes('password')) {
        errorMessage = 'Mot de passe incorrect';
      } else if (errorMessageRaw) {
        errorMessage = errorMessageRaw;
      }
      
      setError(errorMessage);
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
        {/* Titre */}
        <h1 style={{
          textAlign: 'center',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#52414C',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}>
          Connexion
        </h1>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#596157',
          marginTop: '1.5rem',
        }}>
          Pas encore de compte ?{' '}
          <a href="/register" style={{
            color: '#5B8C5A',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            S'inscrire
          </a>
        </p>

        {/* Disclaimer PWA */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          borderRadius: '14px',
          backgroundColor: '#F5F0E8',
          border: '1px solid rgba(91, 140, 90, 0.2)',
        }}>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#52414C',
            marginBottom: '0.5rem',
          }}>
            Ajoute Byoom à ton écran d'accueil
          </p>
          <p style={{
            fontSize: '0.8rem',
            color: '#596157',
            marginBottom: '1rem',
            lineHeight: '1.5',
          }}>
            Pour une meilleure expérience, ajoute Byoom à ton écran d'accueil comme une application native.
          </p>
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#5B8C5A',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {showTutorial ? 'Masquer le tutoriel' : 'Voir le tutoriel →'}
          </button>

          {showTutorial && (
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(91, 140, 90, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              {/* iOS */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🍎</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#52414C' }}>iOS (Safari)</h4>
                </div>
                <ol style={{ marginLeft: '1.5rem', fontSize: '0.75rem', color: '#596157', lineHeight: '1.8' }}>
                  <li>Ouvre Byoom dans Safari</li>
                  <li>Appuie sur le bouton <strong>Partager</strong> <span style={{ fontSize: '1rem' }}>⎋</span> en bas de l'écran</li>
                  <li>Fais défiler et sélectionne <strong>"Sur l'écran d'accueil"</strong></li>
                  <li>Appuie sur <strong>"Ajouter"</strong> en haut à droite</li>
                </ol>
              </div>

              {/* Android */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🤖</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#52414C' }}>Android (Chrome)</h4>
                </div>
                <ol style={{ marginLeft: '1.5rem', fontSize: '0.75rem', color: '#596157', lineHeight: '1.8' }}>
                  <li>Ouvre Byoom dans Chrome</li>
                  <li>Appuie sur le menu <strong>⋮</strong> en haut à droite</li>
                  <li>Sélectionne <strong>"Ajouter à l'écran d'accueil"</strong> ou <strong>"Installer l'application"</strong></li>
                  <li>Confirme en appuyant sur <strong>"Ajouter"</strong> ou <strong>"Installer"</strong></li>
                </ol>
              </div>
            </div>
          )}
        </div>
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
