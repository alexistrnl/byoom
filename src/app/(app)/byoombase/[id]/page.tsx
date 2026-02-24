'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlantIcon } from '@/components/Icons';
import type { Plant } from '@/lib/types/pocketbase';

export default function ByoomBaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      loadPlant(id);
    }
  }, [id]);

  const loadPlant = async (plantId: string) => {
    try {
      const response = await fetch(`/api/plants/${plantId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement de la plante');
      }

      setPlant(data.plant as unknown as Plant);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de la plante..." />;
  }

  if (error || !plant) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="text-center">
          <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
            Plante introuvable
          </h2>
          <Link
            href="/byoombase"
            className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: '#5B8C5A' }}
          >
            Retour à la ByoomBase
          </Link>
        </div>
      </div>
    );
  }

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const imageUrl = plant.cover_image 
    ? `${pbUrl}/api/files/plants/${plant.id}/${plant.cover_image}`
    : null;

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#F5F0E8' }}
    >
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
        {/* Bouton retour */}
        <Link
          href="/byoombase"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#5B8C5A' }}
        >
          ← Retour à la ByoomBase
        </Link>

        {/* Photo hero */}
        <div className="relative mb-6 w-full overflow-hidden rounded-3xl" style={{ height: '50vh', minHeight: '400px' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={plant.common_name || 'Plante'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #5B8C5A 0%, #CFD186 100%)',
              }}
            >
              <PlantIcon size={120} color="white" />
            </div>
          )}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-4xl font-bold" style={{ color: '#52414C' }}>
            {plant.common_name || 'Sans nom'}
          </h1>
          <p className="mb-4 text-xl italic" style={{ color: '#596157' }}>
            {plant.scientific_name}
          </p>
          {plant.family && (
            <div className="mb-4">
              <span className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide" style={{ backgroundColor: '#5B8C5A', color: 'white' }}>
                {plant.family}
              </span>
            </div>
          )}
        </div>

        {/* Histoire */}
        {(plant as any).history && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
              Histoire
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: '#596157' }}>
              {(plant as any).history}
            </p>
          </div>
        )}

        {/* Utilité */}
        {(plant as any).uses && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
              Utilité
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: '#596157' }}>
              {(plant as any).uses}
            </p>
          </div>
        )}

        {/* Fun Facts */}
        {(plant as any).fun_facts && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
              Fun Facts
            </h2>
            <p className="leading-relaxed whitespace-pre-wrap" style={{ color: '#596157' }}>
              {typeof (plant as any).fun_facts === 'string' 
                ? (plant as any).fun_facts 
                : JSON.stringify((plant as any).fun_facts, null, 2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
