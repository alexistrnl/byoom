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
      // Attendre un peu pour que le contexte se mette à jour
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Utiliser window.location.href pour forcer un rechargement complet
      // Cela garantit que le contexte PocketBase sera réinitialisé avec la nouvelle auth
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
      setLoading(false);
    }
  };

  // Générer des positions et tailles fixes pour éviter les re-renders
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: 20 + (i * 7) % 60,
    color: i % 3 === 0 ? '#5B8C5A' : i % 3 === 1 ? '#CFD186' : '#596157',
    left: (i * 23.7) % 100,
    top: (i * 31.3) % 100,
    animation: `float${i % 3}`,
    duration: 15 + (i * 2.3) % 10,
    delay: (i * 1.7) % 5,
  }));

  const leaves = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: (i * 37.5) % 100,
    top: (i * 42.3) % 100,
    animation: `floatLeaf${i % 2}`,
    duration: 20 + (i * 3.1) % 10,
    delay: (i * 2.4) % 8,
    rotation: (i * 45) % 360,
  }));

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Particules flottantes */}
        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `${particle.animation} ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        
        {/* Feuilles flottantes */}
        {leaves.map((leaf) => (
          <div
            key={`leaf-${leaf.id}`}
            className="absolute text-4xl opacity-10"
            style={{
              left: `${leaf.left}%`,
              top: `${leaf.top}%`,
              animation: `${leaf.animation} ${leaf.duration}s ease-in-out infinite`,
              animationDelay: `${leaf.delay}s`,
              transform: `rotate(${leaf.rotation}deg)`,
            }}
          >
            🌿
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-[var(--color-night)]">
          Byoom
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Identifie. Soigne. Collectionne.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[var(--color-moss)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-[var(--color-moss)] hover:opacity-80">
            S'inscrire
          </a>
        </p>

        {/* Disclaimer - Ajouter à l'écran d'accueil */}
        <div className="mt-6 rounded-lg border border-[var(--color-moss)] bg-[var(--color-cream)] p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="mb-2 text-sm font-semibold text-[var(--color-night)]">
                Ajoute Byoom à ton écran d'accueil
              </p>
              <p className="mb-3 text-xs text-gray-700">
                Pour une meilleure expérience, ajoute Byoom à ton écran d'accueil comme une application native.
              </p>
              <button
                onClick={() => setShowTutorial(!showTutorial)}
                className="text-xs font-medium text-[var(--color-moss)] hover:opacity-80"
              >
                {showTutorial ? 'Masquer le tutoriel' : 'Voir le tutoriel →'}
              </button>
            </div>
          </div>

          {showTutorial && (
            <div className="mt-4 space-y-4 border-t border-[var(--color-moss)] pt-4">
              {/* iOS */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">🍎</span>
                  <h4 className="text-sm font-semibold text-[var(--color-night)]">iOS (Safari)</h4>
                </div>
                <ol className="ml-6 list-decimal space-y-1.5 text-xs text-gray-700">
                  <li>Ouvre Byoom dans Safari</li>
                  <li>Appuie sur le bouton <strong>Partager</strong> <span className="text-base">⎋</span> en bas de l'écran</li>
                  <li>Fais défiler et sélectionne <strong>"Sur l'écran d'accueil"</strong></li>
                  <li>Appuie sur <strong>"Ajouter"</strong> en haut à droite</li>
                </ol>
              </div>

              {/* Android */}
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <h4 className="text-sm font-semibold text-[var(--color-night)]">Android (Chrome)</h4>
                </div>
                <ol className="ml-6 list-decimal space-y-1.5 text-xs text-gray-700">
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
    </div>
  );
}
