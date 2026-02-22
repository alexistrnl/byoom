'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Plant } from '@/lib/types/pocketbase';

export default function ByoomBasePage() {
  const { pb } = usePocketBase();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadPlants();
  }, [filter]);

  const loadPlants = async () => {
    try {
      let filterQuery = '';

      if (filter !== 'all') {
        filterQuery = `tags ~ "${filter}"`;
      }

      // Utiliser le contexte PocketBase mais la collection 'plants' est publique
      // donc pas besoin de vérifier l'auth
      const result = await pb.collection('plants').getList(1, 100, {
        filter: filterQuery,
        sort: 'common_name',
        requestKey: null,
      });
      setPlants(result.items as unknown as Plant[]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de la ByoomBase..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-[var(--color-night)]">📚 ByoomBase</h1>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-md px-4 py-2 ${
              filter === 'all'
                ? 'bg-[var(--color-moss)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('intérieur')}
            className={`rounded-md px-4 py-2 ${
              filter === 'intérieur'
                ? 'bg-[var(--color-moss)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Intérieur
          </button>
          <button
            onClick={() => setFilter('extérieur')}
            className={`rounded-md px-4 py-2 ${
              filter === 'extérieur'
                ? 'bg-[var(--color-moss)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Extérieur
          </button>
          <button
            onClick={() => setFilter('succulent')}
            className={`rounded-md px-4 py-2 ${
              filter === 'succulent'
                ? 'bg-[var(--color-moss)] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Succulentes
          </button>
        </div>

        {/* Grille de plantes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plants.map((plant) => (
            <Link
              key={plant.id}
              href={`/byoombase/${plant.id}`}
              className="rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
            >
              {plant.cover_image ? (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={plant.cover_image}
                    alt={plant.common_name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-4 aspect-video w-full rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🌿</span>
                </div>
              )}

              <h3 className="mb-1 font-semibold text-gray-800">{plant.common_name}</h3>
              <p className="mb-2 text-xs text-gray-500 italic">{plant.scientific_name}</p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Difficulté:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={level <= plant.difficulty ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {plants.length === 0 && (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <div className="mb-4 text-6xl">🔍</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Aucune plante trouvée
            </h2>
            <p className="text-gray-600">Essayez un autre filtre</p>
          </div>
        )}
      </div>
    </div>
  );
}
