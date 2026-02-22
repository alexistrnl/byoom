'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { UserPlant, Plant } from '@/lib/types/pocketbase';

export default function MyPlantsPage() {
  const { pb, user: contextUser, loading: contextLoading } = usePocketBase();
  const [userPlants, setUserPlants] = useState<(UserPlant & { expand?: { plant?: Plant } })[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!contextLoading && contextUser) {
      loadPlants();
    } else if (!contextLoading && !contextUser) {
      router.push('/login');
    }
  }, [contextLoading, contextUser]);

  const loadPlants = async () => {
    try {
      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        return;
      }

      const plants = await pb.collection('user_plants').getList(1, 100, {
        filter: `user = "${authData.id}"`,
        sort: '-created',
        expand: 'plant',
        requestKey: null,
      });
      setUserPlants(plants.items as any);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculer le score moyen de santé
  const averageHealthScore =
    userPlants.length > 0
      ? Math.round(
          userPlants.reduce((sum, plant) => sum + (plant.health_score || 0), 0) / userPlants.length
        )
      : 0;

  if (loading || contextLoading) {
    return <LoadingSpinner message="Chargement de tes plantes..." />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-cream)', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="mb-2 font-serif font-bold"
              style={{ fontSize: '2.5rem', color: 'var(--color-night)' }}
            >
              🌿 Mon Jardin
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {userPlants.length} {userPlants.length === 1 ? 'plante' : 'plantes'} · Score moyen santé{' '}
              {averageHealthScore}/100
            </p>
          </div>
          <Link
            href="/identify"
            className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-moss)',
              boxShadow: '0 2px 8px rgba(91, 140, 90, 0.3)',
            }}
          >
            + Identifier une plante
          </Link>
        </div>

        {/* ÉTAT VIDE */}
        {userPlants.length === 0 ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mb-6 text-8xl">🌿</div>
            <h2 className="mb-3 font-serif text-2xl font-bold" style={{ color: 'var(--color-night)' }}>
              Votre jardin vous attend
            </h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed" style={{ color: '#6B7280' }}>
              Commencez votre collection en identifiant votre première plante avec l'intelligence
              artificielle
            </p>
            <Link
              href="/identify"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--color-moss)',
                boxShadow: '0 4px 12px rgba(91, 140, 90, 0.3)',
              }}
            >
              Identifier ma première plante
            </Link>
          </div>
        ) : (
          /* GRILLE DE PLANTES */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
            {userPlants.map((userPlant) => {
              const plant = userPlant.expand?.plant as unknown as Plant | undefined;
              
              // Vérifier si la plante a été diagnostiquée
              const hasDiagnosis = userPlant.health_score > 0;
              
              // Déterminer le statut de santé (seulement si diagnostiquée)
              const healthStatus = hasDiagnosis
                ? userPlant.health_score >= 80
                  ? { label: 'Saine', emoji: '🟢', color: '#10B981' }
                  : userPlant.health_score >= 50
                  ? { label: 'Attention', emoji: '🟡', color: '#F59E0B' }
                  : { label: 'Critique', emoji: '🔴', color: '#EF4444' }
                : null;

              // Couleur de la barre de progression
              const progressColor = hasDiagnosis
                ? userPlant.health_score >= 80
                  ? '#10B981'
                  : userPlant.health_score >= 50
                  ? '#F59E0B'
                  : '#EF4444'
                : '#CFD186';

              // URL de la photo
              const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
              const photoUrl = userPlant.photos?.[0]
                ? `${pbUrl}/api/files/user_plants/${userPlant.id}/${userPlant.photos[0]}`
                : plant?.cover_image || null;

              return (
                <Link
                  key={userPlant.id}
                  href={`/my-plants/${userPlant.id}`}
                  className="group relative block overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    height: '320px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Photo en background ou fond dégradé */}
                  {photoUrl ? (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-moss) 0%, #6BA06A 100%)',
                      }}
                    >
                      <span className="text-6xl">🌿</span>
                    </div>
                  )}

                  {/* Overlay gradient bas */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: '40%',
                      background: 'linear-gradient(to top, rgba(82, 65, 76, 0.9) 0%, transparent 100%)',
                    }}
                  />

                  {/* Contenu en bas par-dessus l'overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {/* Nom commun */}
                    <h3
                      className="mb-1 font-serif font-bold text-white"
                      style={{ fontSize: '1.1rem' }}
                    >
                      {userPlant.nickname || plant?.common_name || 'Sans nom'}
                    </h3>

                    {/* Nom scientifique */}
                    {plant?.scientific_name && (
                      <p
                        className="mb-3 italic text-white"
                        style={{ fontSize: '0.75rem', opacity: 0.6 }}
                      >
                        {plant.scientific_name}
                      </p>
                    )}

                    {/* Barre de santé fine (seulement si diagnostiquée) */}
                    {hasDiagnosis && (
                      <div className="mb-2" style={{ height: '4px' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${userPlant.health_score}%`,
                            backgroundColor: progressColor,
                          }}
                        />
                      </div>
                    )}

                    {/* Badge santé pill (seulement si diagnostiquée) */}
                    {hasDiagnosis && healthStatus ? (
                      <div className="inline-block">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                          style={{
                            backgroundColor: `${healthStatus.color}40`,
                            color: healthStatus.color,
                            border: `1px solid ${healthStatus.color}60`,
                          }}
                        >
                          {healthStatus.emoji} {healthStatus.label}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-block">
                        <span
                          className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                          style={{
                            backgroundColor: 'rgba(207, 209, 134, 0.4)',
                            color: '#CFD186',
                            border: '1px solid rgba(207, 209, 134, 0.6)',
                          }}
                        >
                          🔬 Diagnostic à faire
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
