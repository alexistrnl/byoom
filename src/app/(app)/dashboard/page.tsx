'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { calculateLevel } from '@/lib/gamification';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { UserPlant, Plant } from '@/lib/types/pocketbase';

export default function DashboardPage() {
  const { pb, user: contextUser, loading: contextLoading, refresh } = usePocketBase();
  const [user, setUser] = useState<any>(null);
  const [userPlants, setUserPlants] = useState<(UserPlant & { expand?: { plant?: Plant } })[]>([]);
  const [loading, setLoading] = useState(true);
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
      return 'Tes plantes attendent leur dose de soleil ☀️';
    } else if (hour >= 12 && hour < 18) {
      return 'Comment va ton jardin aujourd\'hui ? 🌿';
    } else {
      return 'Une belle journée pour les plantes 🌙';
    }
  };

  // Prénom ou email
  const getFirstName = () => {
    if (user?.display_name) {
      return user.display_name.split(' ')[0];
    }
    if (user?.username) {
      return user.username.split('@')[0];
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
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* HEADER */}
        <div className="mb-6 md:mb-8">
          <h1
            className="mb-2 font-serif font-bold text-2xl md:text-[1.75rem]"
            style={{ color: '#52414C' }}
          >
            Bonjour, {getFirstName()} 👋
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#596157' }}>
            {getGreeting()}
          </p>
        </div>

        {/* SECTION STATS (3 cards horizontales) */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:mb-8 md:grid-cols-3">
          {/* Card Niveau */}
          <div
            className="rounded-2xl bg-white p-4 md:p-6"
            style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div className="mb-2 text-xs md:text-sm" style={{ color: '#596157' }}>
              Niveau
            </div>
            <div
              className="mb-3 font-serif font-bold text-3xl md:text-[2rem]"
              style={{ color: '#5B8C5A' }}
            >
              {name}
            </div>
            <div className="mb-2 h-1.5 w-full rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: '#5B8C5A',
                }}
              />
            </div>
            <div className="text-xs" style={{ color: '#596157' }}>
              {pointsTotal} / {nextLevelPoints} XP
            </div>
          </div>

          {/* Card Plantes */}
          <div
            className="rounded-2xl bg-white p-4 md:p-6"
            style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div className="mb-2 text-xs md:text-sm" style={{ color: '#596157' }}>
              Plantes
            </div>
            <div className="mb-1 flex items-baseline gap-2">
              <div
                className="font-serif font-bold text-3xl md:text-[2rem]"
                style={{ color: '#52414C' }}
              >
                {userPlants.length}
              </div>
              <span className="text-lg md:text-xl">🌿</span>
            </div>
            <div className="text-xs" style={{ color: '#596157' }}>
              plantes dans ta collection
            </div>
          </div>

          {/* Card Santé moyenne */}
          <div
            className="rounded-2xl bg-white p-4 md:p-6"
            style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <div className="mb-2 text-xs md:text-sm" style={{ color: '#596157' }}>
              Santé moyenne
            </div>
            <div className="mb-1 flex items-baseline gap-2">
              <div
                className="font-serif font-bold text-3xl md:text-[2rem]"
                style={{ color: getHealthColor(averageHealthScore) }}
              >
                {averageHealthScore}
              </div>
              <span className="text-xs" style={{ color: '#596157' }}>
                /100
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getHealthColor(averageHealthScore) }}
              />
              <div className="text-xs" style={{ color: '#596157' }}>
                score de santé moyen
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS RAPIDES (6 boutons) */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:mb-8 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          <Link
            href="/identify"
            className="flex flex-col items-center justify-center rounded-3xl text-center text-white transition-all hover:scale-105 p-4 md:p-6"
            style={{
              backgroundColor: '#5B8C5A',
              minHeight: '100px',
              height: 'auto',
              fontWeight: 600,
            }}
          >
            <div className="mb-1 text-2xl md:mb-2 md:text-3xl">🔍</div>
            <div className="text-sm font-semibold md:text-base">Identifier</div>
            <div className="text-xs opacity-90 md:text-sm">Une nouvelle plante</div>
          </Link>

          <Link
            href="/diagnose"
            className="flex flex-col items-center justify-center rounded-3xl text-center text-white transition-all hover:scale-105 p-4 md:p-6"
            style={{
              backgroundColor: '#52414C',
              minHeight: '100px',
              height: 'auto',
              fontWeight: 600,
            }}
          >
            <div className="mb-1 text-2xl md:mb-2 md:text-3xl">🔬</div>
            <div className="text-sm font-semibold md:text-base">Diagnostiquer</div>
            <div className="text-xs opacity-90 md:text-sm">Santé d'une plante</div>
          </Link>

          <Link
            href="/my-plants"
            className="flex flex-col items-center justify-center rounded-3xl text-center text-white transition-all hover:scale-105 p-4 md:p-6"
            style={{
              backgroundColor: '#596157',
              minHeight: '100px',
              height: 'auto',
              fontWeight: 600,
            }}
          >
            <div className="mb-1 text-2xl md:mb-2 md:text-3xl">🌿</div>
            <div className="text-sm font-semibold md:text-base">Mes plantes</div>
            <div className="text-xs opacity-90 md:text-sm">Voir ma collection</div>
          </Link>

          <Link
            href="/byoombase"
            className="flex flex-col items-center justify-center rounded-3xl text-center transition-all hover:scale-105 p-4 md:p-6"
            style={{
              backgroundColor: '#CFD186',
              color: '#52414C',
              minHeight: '100px',
              height: 'auto',
              fontWeight: 600,
            }}
          >
            <div className="mb-1 text-2xl md:mb-2 md:text-3xl">📖</div>
            <div className="text-sm font-semibold md:text-base">ByoomBase</div>
            <div className="text-xs opacity-90 md:text-sm">Catalogue complet</div>
          </Link>

          {/* Conseil de coupe - Prochainement */}
          <div
            className="flex flex-col items-center justify-center rounded-3xl text-center p-4 md:p-6"
            style={{
              backgroundColor: '#E5E5E5',
              color: '#9CA3AF',
              minHeight: '100px',
              height: 'auto',
              fontWeight: 600,
              opacity: 0.7,
              cursor: 'not-allowed',
            }}
          >
            <div className="mb-1 text-2xl md:mb-2 md:text-3xl">✂️</div>
            <div className="text-sm font-semibold md:text-base">Conseil de coupe</div>
            <div className="text-xs opacity-90 md:text-sm">Prochainement</div>
          </div>

          {/* Compatibilité des plantes - Prochainement */}
          <div
            className="flex flex-col items-center justify-center rounded-3xl text-center p-4 md:p-6"
            style={{
              backgroundColor: '#E5E5E5',
              color: '#9CA3AF',
              minHeight: '100px',
              height: 'auto',
              fontWeight: 600,
              opacity: 0.7,
              cursor: 'not-allowed',
            }}
          >
            <div className="mb-1 text-2xl md:mb-2 md:text-3xl">🌱</div>
            <div className="text-sm font-semibold md:text-base">Compatibilité</div>
            <div className="text-xs opacity-90 md:text-sm">Prochainement</div>
          </div>
        </div>

        {/* DERNIÈRES PLANTES */}
        <div
          className="rounded-2xl bg-white p-4 md:p-6"
          style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}
        >
          <div className="mb-4 flex items-center justify-between md:mb-6">
            <h2
              className="font-serif font-bold text-xl md:text-[1.5rem]"
              style={{ color: '#52414C' }}
            >
              Mon jardin
            </h2>
            {userPlants.length > 0 && (
              <Link
                href="/my-plants"
                className="text-xs font-semibold transition-colors hover:opacity-80 md:text-sm"
                style={{ color: '#5B8C5A' }}
              >
                Voir tout →
              </Link>
            )}
          </div>

          {userPlants.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">🌿</div>
              <p className="mb-4 text-sm" style={{ color: '#596157' }}>
                Aucune plante encore
              </p>
              <Link
                href="/identify"
                className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#5B8C5A' }}
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
                const healthColor = hasDiagnosis
                  ? getHealthColor(userPlant.health_score)
                  : '#CFD186';
                const healthStatus = hasDiagnosis
                  ? userPlant.health_score >= 80
                    ? { label: 'Saine', color: '#10B981' }
                    : userPlant.health_score >= 50
                    ? { label: 'Attention', color: '#F59E0B' }
                    : { label: 'Critique', color: '#EF4444' }
                  : { label: 'Diagnostic à faire', color: '#CFD186' };

                return (
                  <Link
                    key={userPlant.id}
                    href={`/my-plants/${userPlant.id}`}
                    className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid rgba(0, 0, 0, 0.06)' }}
                  >
                    {/* Photo miniature */}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={userPlant.nickname || plant?.common_name || 'Plante'}
                        className="h-12 w-12 rounded-xl object-cover"
                        style={{ borderRadius: '12px' }}
                      />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                        style={{ backgroundColor: '#CFD186' }}
                      >
                        🌿
                      </div>
                    )}

                    {/* Nom + nom scientifique */}
                    <div className="flex-1">
                      <div className="font-semibold" style={{ color: '#52414C' }}>
                        {userPlant.nickname || plant?.common_name || 'Sans nom'}
                      </div>
                      {plant?.scientific_name && (
                        <div className="text-xs italic" style={{ color: '#596157' }}>
                          {plant.scientific_name}
                        </div>
                      )}
                    </div>

                    {/* Badge santé coloré */}
                    <div
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${healthStatus.color}40`,
                        color: healthStatus.color,
                        border: `1px solid ${healthStatus.color}60`,
                      }}
                    >
                      {healthStatus.label}
                    </div>

                    {/* Flèche */}
                    <span className="text-lg" style={{ color: '#596157' }}>
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
