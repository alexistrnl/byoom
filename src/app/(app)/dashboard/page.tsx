'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { calculateLevel } from '@/lib/gamification';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BotanicAssistant } from '@/components/BotanicAssistant';
import type { UserPlant, Plant } from '@/lib/types/pocketbase';

function DashboardContent() {
  const { pb, user: contextUser, loading: contextLoading, refresh } = usePocketBase();
  const [user, setUser] = useState<any>(null);
  const [userPlants, setUserPlants] = useState<(UserPlant & { expand?: { plant?: Plant } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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
        console.warn('points_total est undefined/null, valeur par défaut: 0');
        userData.points_total = 0;
      }
      
      userData.points_total = typeof userData.points_total === 'number' 
        ? userData.points_total 
        : parseInt(userData.points_total) || 0;

      setUser(userData);

      const plants = await pb.collection('user_plants').getList(1, 10, {
        filter: `user = "${authData.id}"`,
        sort: '-created',
        expand: 'plant',
        requestKey: null,
      });
      setUserPlants(plants.items as any);
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
        // Si pas d'utilisateur après le chargement, rediriger vers login
        setLoading(false);
        router.push('/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextLoading, contextUser]);

  // Détecter le paramètre success après paiement
  useEffect(() => {
    const paymentSuccess = searchParams.get('success');
    if (paymentSuccess === 'true' && contextUser && !loading) {
      // Recharger les données user depuis PocketBase pour avoir le nouveau statut premium
      refresh();
      loadData();
      // Afficher le modal de félicitations
      setShowSuccessModal(true);
      // Nettoyer l'URL
      router.replace('/dashboard', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, contextUser, loading]);

  useEffect(() => {
    if (!contextUser || loading) return;
    
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [contextUser, loading, loadData]);

  // Calculer la santé moyenne
  const averageHealthScore =
    userPlants.length > 0
      ? Math.round(
          userPlants.reduce((sum, plant) => sum + (plant.health_score || 0), 0) / userPlants.length
        )
      : 0;

  // Couleur selon le score de santé
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#5B8C5A';
    if (score >= 50) return '#CFD186';
    return '#E3655B';
  };

  // Sous-titre dynamique selon l'heure
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return 'Tes plantes attendent leur dose de soleil';
    } else if (hour >= 12 && hour < 18) {
      return 'Comment va ton jardin aujourd\'hui ?';
    } else {
      return 'Une belle journée pour les plantes';
    }
  };

  // Nom d'utilisateur
  const getUserName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.display_name) {
      return user.display_name;
    }
    return 'Jardinier';
  };

  if (loading || contextLoading || !user) {
    return <LoadingSpinner message="Chargement de ton jardin..." />;
  }

  const pointsTotal = user.points_total || 0;
  const { level, name, nextLevelPoints } = calculateLevel(pointsTotal);
  const progress = nextLevelPoints > 0 ? (pointsTotal / nextLevelPoints) * 100 : 0;

  return (
    <>
      {/* Modal de félicitations Premium */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'fadeInUp 0.4s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl text-gray-400 transition-colors hover:bg-gray-100"
              aria-label="Fermer"
            >
              ✕
            </button>

            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            
            <h2
              className="mb-3 font-serif text-2xl font-bold"
              style={{ color: '#52414C' }}
            >
              Bienvenue dans Byoom Premium !
            </h2>
            
            <p className="mb-6 text-base" style={{ color: '#596157' }}>
              Toutes les fonctionnalités sont maintenant débloquées
            </p>

            <div className="mb-6 space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#596157' }}>
                <span>✅</span>
                <span>Identifications illimitées</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#596157' }}>
                <span>✅</span>
                <span>Diagnostics illimités</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#596157' }}>
                <span>✅</span>
                <span>Accès complet à la Byoombase</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#596157' }}>
                <span>✅</span>
                <span>Chat botanique illimité</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full rounded-full px-6 py-3 text-base font-semibold text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #5B8C5A 0%, #6BA06A 100%)',
                boxShadow: '0 4px 16px rgba(91, 140, 90, 0.3)',
              }}
            >
              Découvrir maintenant 🌿
            </button>
          </div>
        </div>
      )}

      <div
        className="min-h-screen"
        style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
      >
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* HEADER avec fond dégradé */}
        <div className="mb-6 rounded-3xl p-6 md:mb-8 md:p-8" style={{ 
          background: 'linear-gradient(135deg, #5B8C5A 0%, #6BA06A 100%)',
          boxShadow: '0 8px 24px rgba(91, 140, 90, 0.2)'
        }}>
          <div className="flex items-start justify-between">
            <div className="mb-2 flex-1">
              <h1
                className="mb-2 font-serif font-bold text-3xl text-white md:text-4xl"
              >
                Bonjour <strong>{getUserName()}</strong> 👋
              </h1>
              <p className="text-sm text-white opacity-95 md:text-base">
                {getGreeting()}
              </p>
            </div>
            <Link
              href="/profile"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white bg-opacity-30 backdrop-blur-sm transition-all hover:bg-opacity-40 active:scale-95 md:h-14 md:w-14"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              aria-label="Voir mon profil"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: '#52414C' }}
                className="md:w-7 md:h-7"
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
            </Link>
          </div>
        </div>

        {/* SECTION STATS (3 cards horizontales avec design premium) */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:mb-8 md:grid-cols-3 md:gap-6">
          {/* Card Niveau avec gradient */}
          <div
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg md:rounded-3xl md:p-6"
            style={{ 
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            {/* Étoile en bas à droite - partiellement coupée */}
            <div className="absolute opacity-8" style={{ bottom: '-80px', right: '-80px' }}>
              <svg width="180" height="180" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#5B8C5A" />
              </svg>
            </div>
            <div className="relative">
              <div className="mb-2">
                <div className="text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                  Niveau
                </div>
              </div>
              <div
                className="mb-4 font-serif font-bold text-3xl md:text-4xl"
                style={{ color: '#5B8C5A' }}
              >
                {name}
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    background: 'linear-gradient(90deg, #5B8C5A 0%, #6BA06A 100%)',
                    boxShadow: '0 2px 8px rgba(91, 140, 90, 0.4)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm" style={{ color: '#596157' }}>
                <span>{pointsTotal} XP</span>
                <span className="font-semibold">{nextLevelPoints} XP</span>
              </div>
            </div>
          </div>

          {/* Card Plantes avec icône décorative */}
          <div
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg md:rounded-3xl md:p-6"
            style={{ 
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            {/* Plante en bas à droite - partiellement coupée */}
            <div className="absolute opacity-8" style={{ bottom: '-40px', right: '-40px' }}>
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V20M12 2C15 0 18 2 18 6C18 10 15 12 12 14M12 2C9 0 6 2 6 6C6 10 9 12 12 14M8 14C10 16 12 16 14 14M10 18C11 19 12 19 14 18" stroke="#5B8C5A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="relative">
              <div className="mb-2">
                <div className="text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                  Plantes
                </div>
              </div>
              <div className="mb-2">
                <div
                  className="font-serif font-bold text-3xl md:text-4xl"
                  style={{ color: '#52414C' }}
                >
                  {userPlants.length}
                </div>
              </div>
              <div className="text-xs md:text-sm" style={{ color: '#596157' }}>
                dans ta collection
              </div>
            </div>
          </div>

          {/* Card Santé moyenne avec indicateur visuel */}
          <div
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg md:rounded-3xl md:p-6"
            style={{ 
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
            }}
          >
            {/* Cœur en bas à droite - partiellement coupé */}
            <div className="absolute opacity-8" style={{ bottom: '-40px', right: '-40px' }}>
              <svg width="140" height="140" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61Z" fill={getHealthColor(averageHealthScore)} />
              </svg>
            </div>
            <div className="relative">
              <div className="mb-2">
                <div className="text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: '#596157' }}>
                  Santé moyenne
                </div>
              </div>
              <div className="mb-2 flex items-baseline gap-2">
                <div
                  className="font-serif font-bold text-3xl md:text-4xl"
                  style={{ color: getHealthColor(averageHealthScore) }}
                >
                  {averageHealthScore}
                </div>
                <span className="text-sm md:text-base" style={{ color: '#596157' }}>
                  /100
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ 
                    backgroundColor: getHealthColor(averageHealthScore),
                    boxShadow: `0 0 8px ${getHealthColor(averageHealthScore)}60`
                  }}
                />
                <div className="text-xs md:text-sm" style={{ color: '#596157' }}>
                  score de santé
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS RAPIDES avec design premium */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:mb-8 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
          <Link
            href="/identify"
            className="group relative overflow-hidden rounded-2xl text-center text-white transition-all active:scale-[0.98] md:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #5B8C5A 0%, #6BA06A 100%)',
              padding: '24px 16px',
              minHeight: '140px',
              boxShadow: '0 8px 24px rgba(91, 140, 90, 0.3)',
            }}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-20" style={{ backgroundColor: 'white' }} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm md:h-16 md:w-16">
                <span className="text-3xl md:text-4xl">🔍</span>
              </div>
              <div className="mb-1 text-base font-bold md:text-lg">Identifier</div>
              <div className="text-xs opacity-90 md:text-sm">Une nouvelle plante</div>
            </div>
          </Link>

          <Link
            href="/diagnose"
            className="group relative overflow-hidden rounded-2xl text-center text-white transition-all active:scale-[0.98] md:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #52414C 0%, #6B5B6B 100%)',
              padding: '24px 16px',
              minHeight: '140px',
              boxShadow: '0 8px 24px rgba(82, 65, 76, 0.3)',
            }}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-20" style={{ backgroundColor: 'white' }} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm md:h-16 md:w-16">
                <span className="text-3xl md:text-4xl">🔬</span>
              </div>
              <div className="mb-1 text-base font-bold md:text-lg">Diagnostiquer</div>
              <div className="text-xs opacity-90 md:text-sm">Santé d'une plante</div>
            </div>
          </Link>

          <Link
            href="/my-plants"
            className="group relative overflow-hidden rounded-2xl text-center text-white transition-all active:scale-[0.98] md:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #596157 0%, #6B7A6B 100%)',
              padding: '24px 16px',
              minHeight: '140px',
              boxShadow: '0 8px 24px rgba(89, 97, 87, 0.3)',
            }}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-20" style={{ backgroundColor: 'white' }} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white bg-opacity-20 backdrop-blur-sm md:h-16 md:w-16">
                <span className="text-3xl md:text-4xl">🌿</span>
              </div>
              <div className="mb-1 text-base font-bold md:text-lg">Mon jardin</div>
              <div className="text-xs opacity-90 md:text-sm">Voir ma collection</div>
            </div>
          </Link>

          <Link
            href="/byoombase"
            className="group relative overflow-hidden rounded-2xl text-center transition-all active:scale-[0.98] md:rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, #CFD186 0%, #D9E0A0 100%)',
              color: '#52414C',
              padding: '24px 16px',
              minHeight: '140px',
              boxShadow: '0 8px 24px rgba(207, 209, 134, 0.3)',
            }}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-20" style={{ backgroundColor: '#52414C' }} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white bg-opacity-60 backdrop-blur-sm md:h-16 md:w-16">
                <span className="text-3xl md:text-4xl">📖</span>
              </div>
              <div className="mb-1 text-base font-bold md:text-lg">ByoomBase</div>
              <div className="text-xs opacity-90 md:text-sm">Catalogue complet</div>
            </div>
          </Link>
        </div>

        {/* DERNIÈRES PLANTES avec design premium */}
        <div
          className="rounded-2xl bg-white p-5 shadow-lg md:rounded-3xl md:p-6"
          style={{ 
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="mb-5 flex items-center justify-between md:mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12 md:rounded-2xl" style={{ backgroundColor: '#5B8C5A' }}>
                <span className="text-xl md:text-2xl">🌿</span>
              </div>
              <h2
                className="font-serif font-bold text-xl md:text-2xl"
                style={{ color: '#52414C' }}
              >
                Mon jardin
              </h2>
            </div>
            {userPlants.length > 0 && (
              <Link
                href="/my-plants"
                className="rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-95 md:px-5 md:py-2.5 md:text-sm"
                style={{ 
                  color: '#5B8C5A',
                  backgroundColor: 'rgba(91, 140, 90, 0.1)',
                }}
              >
                Voir tout →
              </Link>
            )}
          </div>

          {userPlants.length === 0 ? (
            <div className="py-12 text-center md:py-16">
              <div className="mb-4 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full md:h-24 md:w-24" style={{ backgroundColor: 'rgba(91, 140, 90, 0.1)' }}>
                  <span className="text-5xl md:text-6xl">🌿</span>
                </div>
              </div>
              <h3 className="mb-2 font-serif text-lg font-bold md:text-xl" style={{ color: '#52414C' }}>
                Votre jardin vous attend
              </h3>
              <p className="mb-6 text-sm md:text-base" style={{ color: '#596157' }}>
                Commencez votre collection en identifiant votre première plante
              </p>
              <Link
                href="/identify"
                className="inline-block rounded-full px-6 py-3 text-sm font-semibold text-white transition-all active:scale-95 md:px-8 md:py-3.5 md:text-base"
                style={{ 
                  background: 'linear-gradient(135deg, #5B8C5A 0%, #6BA06A 100%)',
                  boxShadow: '0 4px 16px rgba(91, 140, 90, 0.3)'
                }}
              >
                Identifier ma première plante
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userPlants.map((userPlant) => {
                const plant = userPlant.expand?.plant as unknown as Plant | undefined;
                const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
                const photoUrl = userPlant.photos?.[0]
                  ? `${pbUrl}/api/files/user_plants/${userPlant.id}/${userPlant.photos[0]}`
                  : plant?.cover_image || null;

                // Vérifier si la plante a été diagnostiquée
                const hasDiagnosis = userPlant.health_score > 0;
                const healthStatus = hasDiagnosis
                  ? userPlant.health_score >= 80
                    ? { label: 'Saine', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' }
                    : userPlant.health_score >= 50
                    ? { label: 'Attention', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' }
                    : { label: 'Critique', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
                  : { label: 'À diagnostiquer', color: '#CFD186', bgColor: 'rgba(207, 209, 134, 0.1)' };

                return (
                  <Link
                    key={userPlant.id}
                    href={`/my-plants/${userPlant.id}`}
                    className="group flex items-center gap-4 rounded-xl p-4 transition-all active:scale-[0.98] md:rounded-2xl"
                    style={{ 
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F0E8';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Photo miniature avec bordure */}
                    {photoUrl ? (
                      <div className="relative">
                        <img
                          src={photoUrl}
                          alt={userPlant.nickname || plant?.common_name || 'Plante'}
                          className="h-14 w-14 rounded-xl object-cover md:h-16 md:w-16 md:rounded-2xl"
                          style={{ border: '2px solid rgba(91, 140, 90, 0.2)' }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl md:h-16 md:w-16 md:rounded-2xl"
                        style={{ 
                          background: 'linear-gradient(135deg, #CFD186 0%, #D9E0A0 100%)',
                          border: '2px solid rgba(91, 140, 90, 0.2)'
                        }}
                      >
                        🌿
                      </div>
                    )}

                    {/* Nom + nom scientifique */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 truncate text-base font-bold md:text-lg" style={{ color: '#52414C' }}>
                        {userPlant.nickname || plant?.common_name || 'Sans nom'}
                      </div>
                      {plant?.scientific_name && (
                        <div className="truncate text-xs italic md:text-sm" style={{ color: '#596157' }}>
                          {plant.scientific_name}
                        </div>
                      )}
                    </div>

                    {/* Badge santé coloré avec design amélioré */}
                    <div
                      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold md:px-4 md:py-2 md:text-sm"
                      style={{
                        backgroundColor: healthStatus.bgColor,
                        color: healthStatus.color,
                        border: `1.5px solid ${healthStatus.color}60`,
                      }}
                    >
                      {healthStatus.label}
                    </div>

                    {/* Flèche avec animation */}
                    <span className="shrink-0 text-xl transition-transform group-hover:translate-x-1 md:text-2xl" style={{ color: '#596157' }}>
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <BotanicAssistant />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Chargement..." />}>
      <DashboardContent />
    </Suspense>
  );
}
