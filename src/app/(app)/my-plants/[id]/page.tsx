'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { UserPlant, Plant } from '@/lib/types/pocketbase';

export default function PlantDetailPage() {
  const { pb, user: contextUser, loading: contextLoading } = usePocketBase();
  const params = useParams();
  const router = useRouter();
  const [userPlant, setUserPlant] = useState<(UserPlant & { expand?: { plant?: Plant } }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDiagnosis, setLastDiagnosis] = useState<any>(null);
  const [diagOpen, setDiagOpen] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    if (!contextLoading && contextUser && id) {
      loadPlant(id);
    } else if (!contextLoading && !contextUser) {
      router.push('/login');
    } else if (!contextLoading && !id) {
      setError('ID de plante manquant');
      setLoading(false);
    }
  }, [contextLoading, contextUser, id]);

  const loadPlant = async (plantId: string) => {
    try {
      if (!plantId) {
        setError('ID de plante manquant');
        setLoading(false);
        return;
      }

      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        setLoading(false);
        return;
      }

      // Récupérer le userPlant et le dernier diagnostic via l'API
      // La sécurité est gérée côté API route
      const response = await fetch(`/api/user-plants/${plantId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement de la plante');
      }

      const { userPlant: plant, plant: expandedPlant, lastDiagnosis: diagnosis } = data;

      // Construire l'objet userPlant avec expand
      const userPlantWithExpand = {
        ...plant,
        expand: {
          plant: expandedPlant,
        },
      };

      setUserPlant(userPlantWithExpand as any);
      setLastDiagnosis(diagnosis || null);
      setLoading(false);
    } catch (error: any) {
      console.error('Erreur lors du chargement de la plante:', error);
      setError(error.message || 'Erreur lors du chargement de la plante');
      setLoading(false);
    }
  };

  if (loading || contextLoading) {
    return <LoadingSpinner message="Chargement de la fiche..." />;
  }

  if (error || !userPlant) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Erreur</h1>
          <p className="mb-4 text-gray-700">{error || 'Plante non trouvée'}</p>
          <Link
            href="/my-plants"
            className="inline-block rounded-md bg-[var(--color-moss)] px-4 py-2 text-white hover:opacity-90"
          >
            Retour à mes plantes
          </Link>
        </div>
      </div>
    );
  }

  const plant = userPlant.expand?.plant as unknown as Plant | undefined;
  
  // Vérifier si la plante a déjà été diagnostiquée
  const hasDiagnosis = userPlant.health_score > 0 || lastDiagnosis !== null;
  
  // Déterminer le statut de santé (seulement si diagnostiquée)
  const healthStatus = hasDiagnosis
    ? userPlant.health_score >= 80
      ? { label: 'Saine', emoji: '🟢', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' }
      : userPlant.health_score >= 50
      ? { label: 'Attention', emoji: '🟡', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' }
      : { label: 'Critique', emoji: '🔴', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' }
    : null;

  // Couleur de la barre de progression selon le score
  const progressColor = hasDiagnosis
    ? userPlant.health_score >= 80
      ? '#10B981'
      : userPlant.health_score >= 50
      ? '#F59E0B'
      : '#EF4444'
    : '#CFD186';

  // Fonction pour formater le texte (première lettre majuscule, reste en minuscules)
  const formatText = (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Fonction pour formater la fréquence d'arrosage
  const formatWatering = (watering: string): string => {
    if (!watering) return '';
    // Détecter les mentions de semaines et formater
    const weekMatch = watering.match(/(\d+)\s*(semaine|semaines|sem)/i);
    if (weekMatch) {
      const weeks = weekMatch[1];
      const text = formatText(watering);
      return text.replace(/(\d+)\s*(semaine|semaines|sem)/i, `${weeks} semaine${weeks !== '1' ? 's' : ''}`);
    }
    return formatText(watering);
  };

  // URL de la photo
  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const photoUrl = userPlant.photos?.[0]
    ? `${pbUrl}/api/files/user_plants/${userPlant.id}/${userPlant.photos[0]}`
    : plant?.cover_image || null;

  // La difficulté est sur la collection 'plants', pas 'user_plants'
  const difficulty = Number(plant?.difficulty) || 1;

  // Fonctions helper pour le diagnostic
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#5B8C5A';
    if (score >= 50) return '#CFD186';
    return '#E3655B';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      saine: 'SAINE',
      attention: 'ATTENTION',
      malade: 'MALADE',
      critique: 'CRITIQUE',
    };
    return labels[status.toLowerCase()] || status.toUpperCase();
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      grave: '#E3655B',
      modéré: '#CFD186',
      modere: '#CFD186',
      faible: '#5B8C5A',
    };
    return colors[severity.toLowerCase()] || '#596157';
  };

  const getSeverityEmoji = (severity: string) => {
    const emojis: Record<string, string> = {
      grave: '🔴',
      modéré: '🟡',
      modere: '🟡',
      faible: '🟢',
    };
    return emojis[severity.toLowerCase()] || '⚠️';
  };

  // Parser l'analyse IA pour obtenir le health_score
  const getDiagnosisHealthScore = () => {
    if (!lastDiagnosis?.ai_analysis) return null;
    try {
      const analysis = typeof lastDiagnosis.ai_analysis === 'string' 
        ? JSON.parse(lastDiagnosis.ai_analysis) 
        : lastDiagnosis.ai_analysis;
      return analysis.health_score || null;
    } catch {
      return null;
    }
  };

  const getDiagnosisIssues = () => {
    if (!lastDiagnosis?.ai_analysis) return [];
    try {
      const analysis = typeof lastDiagnosis.ai_analysis === 'string' 
        ? JSON.parse(lastDiagnosis.ai_analysis) 
        : lastDiagnosis.ai_analysis;
      return analysis.issues || [];
    } catch {
      return [];
    }
  };

  const getDiagnosisImmediateActions = () => {
    if (!lastDiagnosis?.ai_analysis) return [];
    try {
      const analysis = typeof lastDiagnosis.ai_analysis === 'string' 
        ? JSON.parse(lastDiagnosis.ai_analysis) 
        : lastDiagnosis.ai_analysis;
      return analysis.immediate_actions || [];
    } catch {
      return [];
    }
  };

  // Données pour la grille d'entretien
  const careItems = [
    plant?.watering_frequency && {
      emoji: '💧',
      label: 'Arrosage',
      text: formatWatering(plant.watering_frequency),
    },
    plant?.light_needs && {
      emoji: '☀️',
      label: 'Lumière',
      text: formatText(plant.light_needs),
    },
    plant?.soil_type && {
      emoji: '🌱',
      label: 'Terreau',
      text: formatText(plant.soil_type),
    },
    (plant?.temperature_min || plant?.temperature_max) && {
      emoji: '🌡️',
      label: 'Température',
      text: `${plant.temperature_min}°C - ${plant.temperature_max}°C`,
    },
    plant?.humidity && {
      emoji: '💨',
      label: 'Humidité',
      text: formatText(plant.humidity),
    },
  ].filter(Boolean);

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#F5F0E8' }}
    >
      {/* MOBILE LAYOUT - Photo en haut, contenu en dessous */}
      <div className="block md:hidden">
        {/* Photo pleine largeur en haut */}
        <div className="relative w-full" style={{ height: '40vh', minHeight: '300px' }}>
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={userPlant.nickname || plant?.common_name || 'Plante'}
                className="h-full w-full object-cover"
              />
              {/* Overlay gradient bas vers haut */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '50%',
                  background: 'linear-gradient(to top, #52414C 0%, transparent 100%)',
                }}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-800">
              <span className="text-6xl">🌿</span>
            </div>
          )}

          {/* Contenu en bas par-dessus le gradient */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {hasDiagnosis ? (
              <>
                {/* Badge statut santé */}
                <div
                  className="mb-3 inline-block rounded-full px-3 py-1.5"
                  style={{
                    backgroundColor: healthStatus?.bgColor,
                    color: healthStatus?.color,
                  }}
                >
                  <span className="text-xs font-semibold">
                    {healthStatus?.emoji} {healthStatus?.label}
                  </span>
                </div>

                {/* Score de santé et barre dans un bloc */}
                <div
                  className="mb-3 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.75rem',
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-white opacity-90">Score de santé</span>
                    <span className="text-sm font-semibold text-white">{userPlant.health_score}/100</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/20">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${userPlant.health_score}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Message si pas encore diagnostiquée */
              <div
                className="mb-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                }}
              >
                <p className="text-xs font-medium text-white opacity-90">
                  🔬 Fais le premier diagnostic pour connaître l'état de santé de ta plante
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contenu scrollable en dessous */}
        <div className="px-4 pb-6 pt-6">
          {/* Lien retour */}
          <Link
            href="/my-plants"
            className="mb-4 inline-flex items-center text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-moss)' }}
          >
            ← Mes plantes
          </Link>

          {/* Nom commun */}
          <h1
            className="mb-1 font-serif font-bold"
            style={{
              fontSize: '1.75rem',
              color: 'var(--color-night)',
              marginBottom: '0.25rem',
            }}
          >
            {userPlant.nickname || plant?.common_name || 'Sans nom'}
          </h1>

          {/* Nom scientifique */}
          {plant?.scientific_name && (
            <p
              className="mb-2 italic"
              style={{
                fontSize: '0.85rem',
                color: '#6B7280',
              }}
            >
              {plant.scientific_name}
            </p>
          )}

          {/* Famille */}
          {plant?.family && (
            <p
              className="mb-4 font-medium uppercase tracking-wider"
              style={{
                fontSize: '0.65rem',
                color: 'var(--color-moss)',
                opacity: 0.7,
              }}
            >
              {plant.family}
            </p>
          )}

          {/* Séparateur fin */}
          <div className="mb-4 h-px" style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }} />

          {/* Bouton Diagnostiquer - Mobile */}
          <Link
            href={`/diagnose?plantId=${userPlant.id}`}
            className="mb-6 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-white transition-all hover:scale-105"
            style={{
              backgroundColor: '#52414C',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            🔬 Diagnostiquer
          </Link>

          {/* Étoiles de difficulté */}
          {plant?.difficulty !== undefined && (
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                Niveau de soin
              </span>
              <div className="flex items-center gap-2">
                <div className="inline-flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      style={{ opacity: level <= difficulty ? 1 : 0.2 }}
                      className="text-base"
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {(() => {
                  const difficultyLabels = {
                    1: { text: 'Très facile', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.15)' },
                    2: { text: 'Facile', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
                    3: { text: 'Moyen', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
                    4: { text: 'Difficile', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
                    5: { text: 'Expert', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.15)' },
                  };
                  const label = difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficultyLabels[1];
                  return (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: label.bgColor,
                        color: label.color,
                      }}
                    >
                      {label.text}
                    </span>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Section Entretien */}
          {careItems.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2
                className="mb-3 font-serif font-bold"
                style={{ fontSize: '1.1rem', color: '#52414C', marginBottom: '0.75rem' }}
              >
                Entretien
              </h2>
              <div
                className="rounded-2xl bg-white"
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '16px',
                  padding: '1rem',
                }}
              >
                <div className="grid grid-cols-1 gap-2.5">
                  {careItems.map((item, index) => (
                    item && (
                      <div
                        key={index}
                        className="rounded-xl bg-gray-50 p-3"
                        style={{
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                        }}
                      >
                        <div className="mb-1 text-base">{item.emoji}</div>
                        <div className="mb-1 text-xs font-bold" style={{ color: '#52414C' }}>
                          {item.label}
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: '#596157' }}>
                          {item.text}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section Dernier diagnostic - Accordéon */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              className="bg-white"
              style={{
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '16px',
              }}
            >
              {/* Header cliquable */}
              {lastDiagnosis ? (
                <div
                  onClick={() => setDiagOpen(!diagOpen)}
                  className="flex cursor-pointer items-center justify-between transition-colors hover:bg-gray-50"
                  style={{
                    padding: '1rem',
                    borderBottom: diagOpen ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                    borderRadius: '16px 16px 0 0',
                  }}
                >
                  <h2
                    className="font-serif font-bold"
                    style={{ fontSize: '1.1rem', color: '#52414C' }}
                  >
                    Dernier diagnostic
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#596157' }}>
                      {new Date(lastDiagnosis.created).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className="text-xs transition-transform duration-300"
                      style={{ transform: diagOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      ▼
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem' }}>
                  <div className="flex items-center justify-between">
                    <h2
                      className="font-serif font-bold"
                      style={{ fontSize: '1.1rem', color: '#52414C' }}
                    >
                      Dernier diagnostic
                    </h2>
                    <Link
                      href={`/diagnose?plantId=${id}`}
                      className="text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-moss)' }}
                    >
                      Aucun — 🔬
                    </Link>
                  </div>
                </div>
              )}

              {/* Contenu accordéon */}
              {lastDiagnosis && (
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: diagOpen ? '2000px' : '0',
                    opacity: diagOpen ? 1 : 0,
                  }}
                >
                  <div style={{ padding: '0 1rem 1rem 1rem' }}>
                    {/* Cercle score santé - Plus petit sur mobile */}
                    <div className="mb-4 flex items-center justify-center">
                      <div className="relative">
                        <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#E5E5E5"
                            strokeWidth="8"
                          />
                          {(() => {
                            const healthScore = getDiagnosisHealthScore() || 0;
                            const color = getHealthColor(healthScore);
                            return (
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={color}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                                className="transition-all duration-1000 ease-out"
                              />
                            );
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div
                              className="text-2xl font-bold"
                              style={{ color: getHealthColor(getDiagnosisHealthScore() || 0) }}
                            >
                              {getDiagnosisHealthScore() || 0}
                            </div>
                            <div className="text-xs" style={{ color: '#596157' }}>
                              /100
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="mb-4 text-center">
                      <span
                        className="rounded-full px-3 py-1.5 text-xs font-bold uppercase"
                        style={{
                          backgroundColor: `${getHealthColor(getDiagnosisHealthScore() || 0)}30`,
                          color: getHealthColor(getDiagnosisHealthScore() || 0),
                        }}
                      >
                        {getStatusLabel(lastDiagnosis.health_status)}
                      </span>
                    </div>

                    {/* Liste des problèmes */}
                    {getDiagnosisIssues().length > 0 && (
                      <div className="mb-4">
                        <h3 className="mb-2 text-xs font-bold" style={{ color: '#52414C' }}>
                          Problèmes détectés
                        </h3>
                        <div className="space-y-2">
                          {getDiagnosisIssues().map((issue: any, idx: number) => {
                            const severityColor = getSeverityColor(issue.severity || 'modéré');
                            const severityEmoji = getSeverityEmoji(issue.severity || 'modéré');
                            return (
                              <div
                                key={idx}
                                className="rounded-lg bg-gray-50 p-2.5"
                                style={{ borderLeft: `3px solid ${severityColor}` }}
                              >
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="text-xs">{severityEmoji}</span>
                                  <span className="text-xs font-semibold" style={{ color: '#52414C' }}>
                                    {issue.type}
                                  </span>
                                </div>
                                {issue.description && (
                                  <p className="text-xs leading-relaxed" style={{ color: '#596157' }}>
                                    {issue.description}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Actions immédiates */}
                    {getDiagnosisImmediateActions().length > 0 && (
                      <div className="mb-4">
                        <h3 className="mb-2 text-xs font-bold" style={{ color: '#52414C' }}>
                          Actions immédiates
                        </h3>
                        <div className="space-y-1">
                          {getDiagnosisImmediateActions().map((action: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: '#596157' }}>
                              <span>•</span>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bouton nouveau diagnostic */}
                    <Link
                      href={`/diagnose?plantId=${id}`}
                      className="block w-full rounded-full px-4 py-2.5 text-center text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--color-moss)' }}
                    >
                      Nouveau diagnostic
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Indicateur toxicité/comestibilité */}
          <div>
            {plant?.toxic_to_pets && (
              <div
                className="inline-block rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#DC2626',
                }}
              >
                ⚠️ Toxique pour les animaux
              </div>
            )}
            {plant?.edible && !plant?.toxic_to_pets && (
              <div
                className="inline-block rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                }}
              >
                🍃 Comestible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT - Deux colonnes côte à côte */}
      <div className="hidden h-screen overflow-hidden md:flex" style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#F5F0E8' }}>
        {/* COLONNE GAUCHE (45%) - Fond sombre */}
        <div className="relative w-[45%]" style={{ backgroundColor: 'var(--color-night)' }}>
          {/* Photo pleine hauteur */}
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt={userPlant.nickname || plant?.common_name || 'Plante'}
                className="h-full w-full object-cover"
              />
              {/* Overlay gradient bas vers haut */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: '40%',
                  background: 'linear-gradient(to top, var(--color-night) 0%, transparent 100%)',
                }}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-800">
              <span className="text-8xl">🌿</span>
            </div>
          )}

          {/* Contenu en bas par-dessus le gradient */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            {hasDiagnosis ? (
              <>
                {/* Badge statut santé */}
                <div
                  className="mb-4 inline-block rounded-full px-4 py-2"
                  style={{
                    backgroundColor: healthStatus?.bgColor,
                    color: healthStatus?.color,
                  }}
                >
                  <span className="text-sm font-semibold">
                    {healthStatus?.emoji} {healthStatus?.label}
                  </span>
                </div>

                {/* Score de santé et barre dans un bloc */}
                <div
                  className="mb-4 rounded-xl"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.75rem',
                  }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-white opacity-90">Score de santé</span>
                    <span className="text-sm font-semibold text-white">{userPlant.health_score}/100</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/20">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{
                        width: `${userPlant.health_score}%`,
                        backgroundColor: progressColor,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Message si pas encore diagnostiquée */
              <div
                className="mb-4 rounded-xl"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                }}
              >
                <p className="text-xs font-medium text-white opacity-90">
                  🔬 Fais le premier diagnostic pour connaître l'état de santé de ta plante
                </p>
              </div>
            )}

            {/* Bouton Diagnostiquer */}
            <Link
              href={`/diagnose?plantId=${userPlant.id}`}
              className="block w-full text-center text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{
                backgroundColor: '#FFFFFF',
                color: 'var(--color-night)',
                borderRadius: '100px',
                padding: '0.75rem 2rem',
                fontWeight: 600,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}
            >
              🔬 Diagnostiquer
            </Link>
          </div>
        </div>

        {/* COLONNE DROITE (55%) - Fond crème */}
        <div
          className="flex w-[55%] flex-col overflow-y-auto"
          style={{ backgroundColor: '#F5F0E8', padding: '2rem' }}
        >
        {/* Lien retour */}
        <Link
          href="/my-plants"
          className="mb-6 inline-flex items-center text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--color-moss)' }}
        >
          ← Mes plantes
        </Link>

        {/* Nom commun */}
        <h1
          className="mb-1 font-serif font-bold"
          style={{
            fontSize: '2rem',
            color: 'var(--color-night)',
            marginBottom: '0.25rem',
          }}
        >
          {userPlant.nickname || plant?.common_name || 'Sans nom'}
        </h1>

        {/* Nom scientifique */}
        {plant?.scientific_name && (
          <p
            className="mb-2 italic"
            style={{
              fontSize: '0.9rem',
              color: '#6B7280',
            }}
          >
            {plant.scientific_name}
          </p>
        )}

        {/* Famille */}
        {plant?.family && (
          <p
            className="mb-6 font-medium uppercase tracking-wider"
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-moss)',
              opacity: 0.7,
            }}
          >
            {plant.family}
          </p>
        )}

        {/* Séparateur fin */}
        <div className="mb-6 h-px" style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }} />

        {/* Étoiles de difficulté */}
        {plant?.difficulty !== undefined && (
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
              Niveau de soin
            </span>
            <div className="flex items-center gap-2">
              <div className="inline-flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    style={{ opacity: level <= difficulty ? 1 : 0.2 }}
                    className="text-lg"
                  >
                    ⭐
                  </span>
                ))}
              </div>
              {(() => {
                const difficultyLabels = {
                  1: { text: 'Très facile', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.15)' },
                  2: { text: 'Facile', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)' },
                  3: { text: 'Moyen', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
                  4: { text: 'Difficile', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
                  5: { text: 'Expert', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.15)' },
                };
                const label = difficultyLabels[difficulty as keyof typeof difficultyLabels] || difficultyLabels[1];
                return (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: label.bgColor,
                      color: label.color,
                    }}
                  >
                    {label.text}
                  </span>
                );
              })()}
            </div>
          </div>
        )}

        {/* Section Entretien */}
        {careItems.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h2
              className="mb-4 font-serif font-bold"
              style={{ fontSize: '1.25rem', color: '#52414C', marginBottom: '1rem' }}
            >
              Entretien
            </h2>
            <div
              className="rounded-2xl bg-white"
              style={{
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '16px',
                padding: '1.25rem',
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                {careItems.map((item, index) => (
                  item && (
                    <div
                      key={index}
                      className="rounded-xl bg-gray-50 p-3"
                      style={{
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        // Si c'est le dernier item et qu'il est seul sur sa ligne, prendre toute la largeur
                        gridColumn: index === careItems.length - 1 && careItems.length % 2 === 1 ? 'span 2' : 'auto',
                      }}
                    >
                      <div className="mb-1 text-lg">{item.emoji}</div>
                      <div className="mb-1 text-xs font-bold" style={{ color: '#52414C' }}>
                        {item.label}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: '#596157' }}>
                        {item.text}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Dernier diagnostic - Accordéon */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            className="bg-white"
            style={{
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '16px',
            }}
          >
            {/* Header cliquable */}
            {lastDiagnosis ? (
              <div
                onClick={() => setDiagOpen(!diagOpen)}
                className="flex cursor-pointer items-center justify-between transition-colors hover:bg-gray-50"
                style={{
                  padding: '1.25rem',
                  borderBottom: diagOpen ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
                  borderRadius: '16px 16px 0 0',
                }}
              >
                <h2
                  className="font-serif font-bold"
                  style={{ fontSize: '1.25rem', color: '#52414C' }}
                >
                  Dernier diagnostic
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: '#596157' }}>
                    {new Date(lastDiagnosis.created).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                  <span
                    className="transition-transform duration-300"
                    style={{ transform: diagOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    ▼
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1.25rem' }}>
                <div className="flex items-center justify-between">
                  <h2
                    className="font-serif font-bold"
                    style={{ fontSize: '1.25rem', color: '#52414C' }}
                  >
                    Dernier diagnostic
                  </h2>
                  <Link
                    href={`/diagnose?plantId=${id}`}
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-moss)' }}
                  >
                    Aucun diagnostic — 🔬 Diagnostiquer
                  </Link>
                </div>
              </div>
            )}

            {/* Contenu accordéon */}
            {lastDiagnosis && (
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: diagOpen ? '2000px' : '0',
                  opacity: diagOpen ? 1 : 0,
                }}
              >
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                  {/* Cercle score santé */}
                  <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#E5E5E5"
                      strokeWidth="8"
                    />
                    {(() => {
                      const healthScore = getDiagnosisHealthScore() || 0;
                      const color = getHealthColor(healthScore);
                      return (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="text-3xl font-bold"
                        style={{ color: getHealthColor(getDiagnosisHealthScore() || 0) }}
                      >
                        {getDiagnosisHealthScore() || 0}
                      </div>
                      <div className="text-xs" style={{ color: '#596157' }}>
                        /100
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                  {/* Statut */}
                  <div className="mb-6 text-center">
                    <span
                      className="rounded-full px-4 py-2 text-xs font-bold uppercase"
                      style={{
                        backgroundColor: `${getHealthColor(getDiagnosisHealthScore() || 0)}30`,
                        color: getHealthColor(getDiagnosisHealthScore() || 0),
                      }}
                    >
                      {getStatusLabel(lastDiagnosis.health_status)}
                    </span>
                  </div>

                  {/* Liste des problèmes */}
                  {getDiagnosisIssues().length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-bold" style={{ color: '#52414C' }}>
                        Problèmes détectés
                      </h3>
                      <div className="space-y-2">
                        {getDiagnosisIssues().map((issue: any, idx: number) => {
                          const severityColor = getSeverityColor(issue.severity || 'modéré');
                          const severityEmoji = getSeverityEmoji(issue.severity || 'modéré');
                          return (
                            <div
                              key={idx}
                              className="rounded-lg bg-gray-50 p-3"
                              style={{ borderLeft: `3px solid ${severityColor}` }}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span>{severityEmoji}</span>
                                <span className="text-xs font-semibold" style={{ color: '#52414C' }}>
                                  {issue.type}
                                </span>
                              </div>
                              {issue.description && (
                                <p className="text-xs" style={{ color: '#596157' }}>
                                  {issue.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions immédiates */}
                  {getDiagnosisImmediateActions().length > 0 && (
                    <div className="mb-6">
                      <h3 className="mb-3 text-sm font-bold" style={{ color: '#52414C' }}>
                        Actions immédiates
                      </h3>
                      <div className="space-y-1">
                        {getDiagnosisImmediateActions().map((action: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs" style={{ color: '#596157' }}>
                            <span>•</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bouton nouveau diagnostic */}
                  <Link
                    href={`/diagnose?plantId=${id}`}
                    className="block w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--color-moss)' }}
                  >
                    Nouveau diagnostic
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Indicateur toxicité/comestibilité */}
        <div className="mt-auto pt-6">
          {plant?.toxic_to_pets && (
            <div
              className="inline-block rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#DC2626',
              }}
            >
              ⚠️ Toxique pour les animaux
            </div>
          )}
          {plant?.edible && !plant?.toxic_to_pets && (
            <div
              className="inline-block rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
              }}
            >
              🍃 Comestible
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

