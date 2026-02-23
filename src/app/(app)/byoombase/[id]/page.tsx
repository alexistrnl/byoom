'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WaterIcon, SunIcon, TemperatureIcon, HumidityIcon, SoilIcon, StarIcon, PlantIcon, AlertCircleIcon, CheckCircleIcon, LeafIcon } from '@/components/Icons';
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
    ? plant.cover_image.startsWith('http')
      ? plant.cover_image
      : `${pbUrl}/api/files/plants/${plant.id}/${plant.cover_image}`
    : null;

  const difficulty = Number(plant.difficulty) || 1;

  // Type pour les items d'entretien
  type CareItem = {
    icon: React.ComponentType<any>;
    label: string;
    text: string;
  };

  // Données pour la grille d'entretien
  const careItems: CareItem[] = [
    {
      icon: WaterIcon,
      label: 'Arrosage',
      text: plant.watering_frequency || '',
    },
    {
      icon: SunIcon,
      label: 'Lumière',
      text: plant.light_needs || '',
    },
    {
      icon: SoilIcon,
      label: 'Terreau',
      text: plant.soil_type || '',
    },
    {
      icon: TemperatureIcon,
      label: 'Température',
      text: `${plant.temperature_min || '?'}°C - ${plant.temperature_max || '?'}°C`,
    },
    {
      icon: HumidityIcon,
      label: 'Humidité',
      text: plant.humidity || '',
    },
  ].filter((item) => item.text) as CareItem[];

  // Parse fun_facts si c'est une string JSON
  let funFacts: string[] = [];
  if (plant.tags && Array.isArray(plant.tags)) {
    funFacts = plant.tags;
  } else if ((plant as any).fun_facts) {
    try {
      const parsed = typeof (plant as any).fun_facts === 'string' 
        ? JSON.parse((plant as any).fun_facts) 
        : (plant as any).fun_facts;
      funFacts = Array.isArray(parsed) ? parsed : [];
    } catch {
      funFacts = [];
    }
  }

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
          {/* Difficulté */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <StarIcon
                  key={level}
                  size={20}
                  color="#F59E0B"
                  filled={level <= difficulty}
                />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: '#596157' }}>
              {['Très facile', 'Facile', 'Moyen', 'Difficile', 'Expert'][difficulty - 1]}
            </span>
          </div>
        </div>

        {/* Description & Histoire */}
        {((plant as any).brief_description || (plant as any).history) && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
              Description & Histoire
            </h2>
            {(plant as any).brief_description && (
              <p className="mb-4 leading-relaxed" style={{ color: '#596157' }}>
                {(plant as any).brief_description}
              </p>
            )}
            {(plant as any).history && (
              <div>
                <h3 className="mb-2 font-semibold" style={{ color: '#52414C' }}>
                  Origine & Histoire
                </h3>
                <p className="leading-relaxed" style={{ color: '#596157' }}>
                  {(plant as any).history}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fun Facts */}
        {funFacts.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
              Fun Facts
            </h2>
            <div className="flex flex-wrap gap-2">
              {funFacts.map((fact, idx) => (
                <span
                  key={idx}
                  className="rounded-full px-4 py-2 text-sm font-medium"
                  style={{ backgroundColor: '#CFD186', color: '#52414C' }}
                >
                  {fact}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Guide d'entretien */}
        {careItems.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <h2 className="mb-6 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
              Guide d'entretien
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {careItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ backgroundColor: '#F5F0E8' }}
                  >
                    {Icon && (
                      <div className="flex-shrink-0">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: '#5B8C5A' }}
                        >
                          <Icon size={24} color="white" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: '#596157' }}>
                        {item.label}
                      </div>
                      <div className="text-sm font-medium" style={{ color: '#52414C' }}>
                        {item.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Utilité */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
          <h2 className="mb-4 font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
            Utilité
          </h2>
          <div className="space-y-3">
            {plant.edible && (
              <div className="flex items-center gap-3">
                <CheckCircleIcon size={24} color="#5B8C5A" />
                <span className="font-medium" style={{ color: '#52414C' }}>
                  Comestible
                </span>
              </div>
            )}
            {plant.toxic_to_pets && (
              <div className="flex items-center gap-3">
                <AlertCircleIcon size={24} color="#E3655B" />
                <span className="font-medium" style={{ color: '#52414C' }}>
                  Toxique pour les animaux
                </span>
              </div>
            )}
            {!plant.toxic_to_pets && (
              <div className="flex items-center gap-3">
                <CheckCircleIcon size={24} color="#5B8C5A" />
                <span className="font-medium" style={{ color: '#52414C' }}>
                  Non toxique pour les animaux
                </span>
              </div>
            )}
            {plant.bonsai_compatible && (
              <div className="flex items-center gap-3">
                <LeafIcon size={24} color="#5B8C5A" />
                <span className="font-medium" style={{ color: '#52414C' }}>
                  Compatible bonsaï
                </span>
              </div>
            )}
            {(plant as any).uses && (
              <div className="mt-4">
                <h3 className="mb-2 font-semibold" style={{ color: '#52414C' }}>
                  Utilisations
                </h3>
                <p className="leading-relaxed" style={{ color: '#596157' }}>
                  {(plant as any).uses}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
