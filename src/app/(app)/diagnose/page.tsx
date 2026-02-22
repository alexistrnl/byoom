'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import type { UserPlant, Plant } from '@/lib/types/pocketbase';

export default function DiagnosePage() {
  const { pb, user: contextUser, loading: contextLoading } = usePocketBase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantIdParam = searchParams.get('plantId');

  const [userPlant, setUserPlant] = useState<(UserPlant & { expand?: { plant?: Plant } }) | null>(null);
  const [userPlants, setUserPlants] = useState<(UserPlant & { expand?: { plant?: Plant } })[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(plantIdParam || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [checkedActions, setCheckedActions] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!contextLoading && contextUser) {
      if (plantIdParam) {
        loadPlant();
      } else {
        loadAllPlants();
      }
    } else if (!contextLoading && !contextUser) {
      router.push('/login');
    }
  }, [contextLoading, contextUser, plantIdParam]);

  useEffect(() => {
    if (selectedPlantId && !plantIdParam) {
      // Si une plante est sélectionnée depuis le dropdown, charger ses infos avec expand
      const loadSelectedPlant = async () => {
        try {
          const authData = pb.authStore.model;
          if (!authData) return;

          const plant = await pb.collection('user_plants').getOne(selectedPlantId, {
            expand: 'plant',
            requestKey: null,
          });

          if (plant.user === authData.id) {
            setUserPlant(plant as any);
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la plante sélectionnée:', error);
        }
      };

      loadSelectedPlant();
    }
  }, [selectedPlantId, plantIdParam, pb]);

  const loadPlant = async () => {
    try {
      if (!plantIdParam) return;

      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        return;
      }

      const plant = await pb.collection('user_plants').getOne(plantIdParam, {
        expand: 'plant',
        requestKey: null,
      });

      if (plant.user !== authData.id) {
        setError('Cette plante ne vous appartient pas');
        return;
      }

      setUserPlant(plant as any);
      setSelectedPlantId(plantIdParam);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement de la plante');
    }
  };

  const loadAllPlants = async () => {
    try {
      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        return;
      }

      const plants = await pb.collection('user_plants').getList(1, 100, {
        filter: `user = "${authData.id}"`,
        expand: 'plant',
        sort: '-created',
        requestKey: null,
      });

      setUserPlants(plants.items as any);
    } catch (error) {
      console.error('Erreur lors du chargement des plantes:', error);
    }
  };

  const handleCapture = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDiagnose = async () => {
    if (!image || !selectedPlantId) {
      setError('Veuillez sélectionner une plante et une image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authData = pb.authStore.model;
      if (!authData) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('image', image);
      formData.append('userPlantId', selectedPlantId);
      formData.append('userId', authData.id);

      const response = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du diagnostic');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du diagnostic');
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (index: number) => {
    const newChecked = new Set(checkedActions);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedActions(newChecked);
  };

  // Couleur selon le score
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#5B8C5A';
    if (score >= 50) return '#CFD186';
    return '#E3655B';
  };

  // Statut en texte
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      saine: 'SAINE',
      attention: 'ATTENTION',
      malade: 'MALADE',
      critique: 'CRITIQUE',
    };
    return labels[status] || status.toUpperCase();
  };

  // Couleur bordure selon sévérité
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      grave: '#E3655B',
      modéré: '#CFD186',
      modere: '#CFD186',
      faible: '#5B8C5A',
    };
    return colors[severity.toLowerCase()] || '#596157';
  };

  // Emoji selon sévérité
  const getSeverityEmoji = (severity: string) => {
    const emojis: Record<string, string> = {
      grave: '🔴',
      modéré: '🟡',
      modere: '🟡',
      faible: '🟢',
    };
    return emojis[severity.toLowerCase()] || '⚠️';
  };

  if (loading || contextLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
      >
        <div style={{ color: '#52414C' }}>Chargement...</div>
      </div>
    );
  }

  if (!userPlant && plantIdParam) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
      >
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-gray-700">{error || 'Plante non trouvée'}</p>
          <Link
            href="/my-plants"
            className="mt-4 inline-block rounded-md bg-[var(--color-moss)] px-4 py-2 text-white hover:opacity-90"
          >
            Retour à mes plantes
          </Link>
        </div>
      </div>
    );
  }

  const plant = userPlant?.expand?.plant as unknown as Plant | undefined;

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-2xl px-4">
        {!result ? (
          /* ÉTAT AVANT (upload) */
          <div>
            {/* HEADER */}
            <div className="mb-8 text-center">
              <div
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#5B8C5A', letterSpacing: '0.1em' }}
              >
                DIAGNOSTIC IA
              </div>
              <h1
                className="mb-3 font-serif font-bold"
                style={{ fontSize: '2.5rem', color: '#52414C' }}
              >
                Comment va ta plante ?
              </h1>
              <p className="text-base" style={{ color: '#6B7280' }}>
                Prends une photo et l'IA analyse sa santé en quelques secondes
              </p>
            </div>

            {/* Sélecteur de plante si pas de plantId */}
            {!plantIdParam && (
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                  Choisir une plante
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="w-full rounded-xl border-2 px-4 py-3 text-sm transition-colors focus:outline-none"
                  style={{
                    borderColor: '#5B8C5A',
                    color: '#52414C',
                  }}
                >
                  <option value="">-- Sélectionner une plante --</option>
                  {userPlants.map((up) => {
                    const p = up.expand?.plant as unknown as Plant | undefined;
                    return (
                      <option key={up.id} value={up.id}>
                        {up.nickname || p?.common_name || 'Sans nom'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* ZONE D'UPLOAD */}
            <div className="relative">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="relative flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 transition-all"
                style={{
                  borderColor: isDragging ? '#5B8C5A' : '#CFD186',
                  backgroundColor: isDragging ? 'rgba(91, 140, 90, 0.05)' : 'white',
                  boxShadow: '0 8px 40px rgba(82, 65, 76, 0.08)',
                }}
              >
                {/* Info plante si plantId présent ou sélectionnée depuis dropdown */}
                {userPlant && (plantIdParam || selectedPlantId) && (
                  <div
                    className="mb-6 flex items-center gap-3 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(91, 140, 90, 0.08)',
                      padding: '0.75rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    {(() => {
                      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
                      const photoUrl = userPlant.photos?.[0]
                        ? `${pbUrl}/api/files/user_plants/${userPlant.id}/${userPlant.photos[0]}`
                        : plant?.cover_image || null;
                      return (
                        <>
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={userPlant.nickname || plant?.common_name || 'Plante'}
                              className="h-15 w-15 rounded-full object-cover"
                              style={{ width: '60px', height: '60px' }}
                            />
                          ) : (
                            <div
                              className="flex h-15 w-15 items-center justify-center rounded-full text-2xl"
                              style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#CFD186',
                              }}
                            >
                              🌿
                            </div>
                          )}
                          <div>
                            <div className="font-bold" style={{ color: '#52414C' }}>
                              {userPlant.nickname || plant?.common_name || 'Sans nom'}
                            </div>
                            {plant?.scientific_name && (
                              <div className="text-xs italic" style={{ color: '#6B7280' }}>
                                {plant.scientific_name}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {!imagePreview ? (
                  <>
                    {/* Grand cercle vert avec icône */}
                    <div
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white"
                      style={{ backgroundColor: '#5B8C5A' }}
                    >
                      🔬
                    </div>
                    <h2
                      className="mb-2 font-serif font-semibold"
                      style={{ fontSize: '1.5rem', color: '#52414C' }}
                    >
                      Glisse ta photo ici
                    </h2>
                    <p className="mb-6 text-sm" style={{ color: '#6B7280' }}>
                      ou choisis une option
                    </p>

                    {/* Deux boutons côte à côte */}
                    <div className="flex gap-4">
                      {showCamera ? (
                        <div className="w-full">
                          <CameraCapture
                            onCapture={(file) => {
                              handleCapture(file);
                              setShowCamera(false);
                            }}
                            label="📷 Prendre une photo"
                          />
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setShowCamera(true)}
                            className="rounded-full px-8 py-4 font-semibold text-white transition-all hover:scale-105"
                            style={{ backgroundColor: '#5B8C5A' }}
                          >
                            📷 Prendre une photo
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full border-2 px-8 py-4 font-semibold transition-all hover:scale-105"
                            style={{
                              backgroundColor: 'white',
                              borderColor: '#5B8C5A',
                              color: '#5B8C5A',
                            }}
                          >
                            📁 Choisir un fichier
                          </button>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </>
                ) : (
                  <>
                    {/* Preview après sélection */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mb-4 w-full rounded-2xl object-cover"
                      style={{ height: '300px' }}
                    />
                    <button
                      onClick={handleDiagnose}
                      disabled={loading}
                      className="mb-2 w-full rounded-full px-6 py-4 text-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                      style={{ backgroundColor: '#5B8C5A' }}
                    >
                      🔬 Analyser
                    </button>
                    <button
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="text-sm underline"
                      style={{ color: '#6B7280' }}
                    >
                      Changer de photo
                    </button>
                  </>
                )}

                {/* Loader pendant analyse */}
                {loading && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div
                      className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#5B8C5A] border-t-transparent"
                    />
                    <p
                      className="animate-pulse font-semibold"
                      style={{ color: '#52414C' }}
                    >
                      L'IA analyse ta plante...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>
            )}
          </div>
        ) : (
          /* ÉTAT APRÈS (résultats) */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[40%_60%]">
            {/* COLONNE GAUCHE (40%) */}
            <div>
              {/* Photo uploadée */}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Plante diagnostiquée"
                  className="mb-6 w-full rounded-3xl object-cover shadow-lg"
                  style={{ maxHeight: '300px' }}
                />
              )}

              {/* Cercle SVG de progression animé */}
              <div className="relative flex items-center justify-center">
                <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Cercle de fond */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E5E5"
                    strokeWidth="8"
                  />
                  {/* Cercle de progression animé */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={getHealthColor(result.diagnosis.health_score)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.diagnosis.health_score / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Score au centre */}
                <div className="absolute text-center">
                  <div
                    className="text-5xl font-bold"
                    style={{ color: getHealthColor(result.diagnosis.health_score) }}
                  >
                    {result.diagnosis.health_score}
                  </div>
                  <div className="text-sm" style={{ color: '#596157' }}>
                    /100
                  </div>
                </div>
              </div>

              {/* Label statut */}
              <div className="mt-4 text-center">
                <span
                  className="rounded-full px-4 py-2 text-sm font-bold uppercase"
                  style={{
                    backgroundColor: `${getHealthColor(result.diagnosis.health_score)}30`,
                    color: getHealthColor(result.diagnosis.health_score),
                  }}
                >
                  {getStatusLabel(result.diagnosis.overall_status)}
                </span>
              </div>
            </div>

            {/* COLONNE DROITE (60%) */}
            <div>
              <h2
                className="mb-6 font-serif text-3xl font-bold"
                style={{ color: '#52414C' }}
              >
                Diagnostic
                {plant && (
                  <span className="block text-xl font-normal" style={{ color: '#596157' }}>
                    {userPlant?.nickname || plant.common_name}
                  </span>
                )}
              </h2>

              {/* Problèmes détectés */}
              {result.diagnosis.issues && result.diagnosis.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 text-lg font-bold" style={{ color: '#52414C' }}>
                    Problèmes détectés
                  </h3>
                  <div className="space-y-3">
                    {result.diagnosis.issues.map((issue: any, idx: number) => {
                      const severityColor = getSeverityColor(issue.severity);
                      const severityEmoji = getSeverityEmoji(issue.severity);
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-white p-4 shadow-sm"
                          style={{ borderLeft: `4px solid ${severityColor}` }}
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xl">{severityEmoji}</span>
                            <span className="font-bold" style={{ color: '#52414C' }}>
                              {issue.type}
                            </span>
                          </div>
                          <p className="mb-3 text-sm" style={{ color: '#596157' }}>
                            {issue.description}
                          </p>
                          <div className="text-sm" style={{ color: '#5B8C5A' }}>
                            <span className="font-semibold">💡 Solution :</span> {issue.solution}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions immédiates */}
              {result.diagnosis.immediate_actions &&
                result.diagnosis.immediate_actions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="mb-4 text-lg font-bold" style={{ color: '#52414C' }}>
                      Actions immédiates
                    </h3>
                    <div className="space-y-2">
                      {result.diagnosis.immediate_actions.map((action: string, idx: number) => (
                        <label
                          key={idx}
                          className="flex cursor-pointer items-center gap-3 rounded-lg bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checkedActions.has(idx)}
                            onChange={() => toggleAction(idx)}
                            className="h-5 w-5 rounded border-2"
                            style={{
                              accentColor: '#5B8C5A',
                            }}
                          />
                          <span className="text-sm" style={{ color: '#52414C' }}>
                            {action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              {/* Badge XP animé */}
              {result.xpAwarded > 0 && (
                <div
                  className="mb-6 animate-fade-in-up rounded-full px-4 py-2 text-center text-sm font-semibold"
                  style={{
                    backgroundColor: '#CFD186',
                    color: '#52414C',
                    animation: 'fadeInUp 0.5s ease-out',
                  }}
                >
                  ⚡ +{result.xpAwarded} XP gagnés !
                </div>
              )}

              {/* Bouton retour */}
              {(() => {
                const plantId = plantIdParam || selectedPlantId;
                if (plantId && plantId !== 'null') {
                  return (
                    <Link
                      href={`/my-plants/${plantId}`}
                      className="block w-full rounded-full px-6 py-3 text-center font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: '#5B8C5A' }}
                    >
                      Retour à ma plante
                    </Link>
                  );
                } else {
                  return (
                    <Link
                      href="/my-plants"
                      className="block w-full rounded-full px-6 py-3 text-center font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: '#5B8C5A' }}
                    >
                      Retour à mes plantes
                    </Link>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
