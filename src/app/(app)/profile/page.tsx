'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { calculateLevel } from '@/lib/gamification';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const { pb, user: contextUser, loading: contextLoading, logout, refresh } = usePocketBase();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadData = useCallback(async () => {
    if (!contextUser) {
      router.push('/login');
      setLoading(false);
      return;
    }

    try {
      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const userData = await pb.collection('users').getOne(authData.id, { requestKey: null });
      
      if (userData.points_total === undefined || userData.points_total === null) {
        userData.points_total = 0;
      }
      
      userData.points_total = typeof userData.points_total === 'number' 
        ? userData.points_total 
        : parseInt(userData.points_total) || 0;

      setUser(userData);
      setUsername(userData.name || '');
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [contextUser, pb, router]);

  useEffect(() => {
    if (!contextLoading) {
      if (contextUser) {
        loadData();
      } else {
        setLoading(false);
        router.push('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading, contextUser]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      setError('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/update-username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: username.trim(), 
          userId: authData.id 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur lors de la mise à jour');
        return;
      }

      setUser(data.user);
      setUsername(data.user.name);
      setEditingUsername(false);
      await refresh();
    } catch (error: any) {
      setError('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUsername(user?.name || '');
    setEditingUsername(false);
    setError('');
  };

  if (loading || contextLoading || !user) {
    return <LoadingSpinner message="Chargement de ton profil..." />;
  }

  const pointsTotal = user.points_total || 0;
  const { level, name, nextLevelPoints } = calculateLevel(pointsTotal);
  const progress = nextLevelPoints > 0 ? (pointsTotal / nextLevelPoints) * 100 : 0;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
        {/* HEADER avec bouton retour */}
        <div className="mb-6 flex items-center gap-4 md:mb-8">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all active:scale-95 md:h-12 md:w-12"
            style={{ 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            aria-label="Retour"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: '#52414C' }}
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1
            className="font-serif font-bold text-2xl md:text-3xl"
            style={{ color: '#52414C' }}
          >
            Mon profil
          </h1>
        </div>

        {/* CARD PROFIL avec fond dégradé */}
        <div className="mb-6 rounded-3xl p-6 md:mb-8 md:p-8" style={{ 
          background: 'linear-gradient(135deg, #5B8C5A 0%, #6BA06A 100%)',
          boxShadow: '0 8px 24px rgba(91, 140, 90, 0.2)'
        }}>
          <div className="mb-6 flex items-center gap-4">
            <div 
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white bg-opacity-30 backdrop-blur-sm md:h-24 md:w-24"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: '#52414C' }}
              >
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  fill="currentColor"
                />
                <path
                  d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="mb-1 font-serif font-bold text-2xl text-white md:text-3xl">
                {user.display_name || user.name || 'Jardinier'}
              </h2>
              <p className="text-sm text-white opacity-90 md:text-base">
                {user.email || user.name}
              </p>
            </div>
          </div>

          {/* Niveau et XP (optionnel) */}
          {pointsTotal > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white opacity-90 md:text-base">
                  Niveau {name}
                </span>
                <span className="text-sm text-white opacity-80 md:text-base">
                  {pointsTotal} XP
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white bg-opacity-20">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'rgba(255, 255, 255, 0.9)',
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-white opacity-80 md:text-sm">
                {nextLevelPoints - pointsTotal} XP jusqu'au niveau suivant
              </p>
            </div>
          )}
        </div>

        {/* INFORMATIONS DU COMPTE */}
        <div
          className="mb-6 rounded-2xl bg-white p-5 shadow-lg md:mb-8 md:rounded-3xl md:p-6"
          style={{ 
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <h3 className="mb-4 font-serif font-bold text-xl md:text-2xl" style={{ color: '#52414C' }}>
            Informations du compte
          </h3>
          <div className="space-y-4">
            {/* Nom d'utilisateur - éditable */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                  Nom d'utilisateur
                </div>
                {!editingUsername && (
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-xs font-semibold transition-colors md:text-sm"
                    style={{ color: '#5B8C5A' }}
                  >
                    Modifier
                  </button>
                )}
              </div>
              {editingUsername ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border-2 px-4 py-3 text-base transition-all focus:outline-none md:text-lg"
                    style={{ 
                      borderColor: error ? '#E3655B' : '#5B8C5A',
                      color: '#52414C'
                    }}
                    placeholder="Nom d'utilisateur"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm" style={{ color: '#E3655B' }}>
                      {error}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUsername}
                      disabled={saving}
                      className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50 md:text-base"
                      style={{ 
                        background: 'linear-gradient(135deg, #5B8C5A 0%, #6BA06A 100%)',
                      }}
                    >
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 md:text-base"
                      style={{ 
                        borderColor: '#596157',
                        color: '#596157'
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-base md:text-lg" style={{ color: '#52414C' }}>
                  {user.name || 'Non défini'}
                </div>
              )}
            </div>

            {/* Email - lecture seule */}
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                Email
              </div>
              <div className="text-base md:text-lg" style={{ color: '#52414C' }}>
                {user.email || 'Non défini'}
              </div>
            </div>

            {/* Nom d'affichage - lecture seule */}
            {user.display_name && (
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                  Nom d'affichage
                </div>
                <div className="text-base md:text-lg" style={{ color: '#52414C' }}>
                  {user.display_name}
                </div>
              </div>
            )}

            {/* Membre depuis - lecture seule */}
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                Membre depuis
              </div>
              <div className="text-base md:text-lg" style={{ color: '#52414C' }}>
                {user.created ? new Date(user.created).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Non disponible'}
              </div>
            </div>
          </div>
        </div>

        {/* BOUTON DÉCONNEXION */}
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-white px-6 py-4 text-base font-semibold transition-all active:scale-[0.98] md:rounded-3xl md:py-5 md:text-lg"
          style={{ 
            color: '#E3655B',
            border: '2px solid #E3655B',
            boxShadow: '0 4px 16px rgba(227, 101, 91, 0.2)'
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
