'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPocketBaseClient } from '@/lib/pocketbase';

export default function IdentifyPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setResult(null);
      setError('');
      
      // Utiliser FileReader pour convertir en base64 (persistant sur iOS)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
      };
      reader.onerror = () => {
        setError('Erreur lors de la lecture de l\'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setResult(null);
      setError('');
      
      // Utiliser FileReader pour convertir en base64 (persistant sur iOS)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
      };
      reader.onerror = () => {
        setError('Erreur lors de la lecture de l\'image');
      };
      reader.readAsDataURL(file);
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

  const handleIdentify = async () => {
    if (!image) return;

    setLoading(true);
    setError('');

    try {
      const pb = getPocketBaseClient();
      const authData = pb.authStore.model;

      if (!authData) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('image', image);
      formData.append('userId', authData.id);

      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'identification');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'identification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        {!result ? (
          /* ÉTAT AVANT (upload/identification) */
          <div>
            {/* HEADER */}
            <div className="mb-8 text-center">
              <div
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: '#5B8C5A', letterSpacing: '0.1em' }}
              >
                IDENTIFICATION IA
              </div>
              <h1
                className="mb-3 font-serif font-bold"
                style={{ fontSize: '2.5rem', color: '#52414C' }}
              >
                Quelle est cette plante ?
              </h1>
              <p className="text-base" style={{ color: '#6B7280' }}>
                Upload une photo et l'IA identifie ta plante en quelques secondes
              </p>
            </div>

            {/* ZONE D'UPLOAD */}
            {!imagePreview ? (
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
                {/* Grand cercle vert avec icône */}
                <div
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white"
                  style={{ backgroundColor: '#5B8C5A' }}
                >
                  🔍
                </div>
                <h2
                  className="mb-2 font-serif font-semibold"
                  style={{ fontSize: '1.5rem', color: '#52414C' }}
                >
                  Glisse ta photo ici
                </h2>
                <p className="mb-6 text-sm" style={{ color: '#6B7280' }}>
                  ou choisis un fichier
                </p>

                {/* Bouton pour choisir un fichier */}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              /* PREVIEW AVEC BOUTON IDENTIFIER */
              <div
                className="rounded-3xl bg-white p-8"
                style={{ boxShadow: '0 8px 40px rgba(82, 65, 76, 0.08)' }}
              >
                {/* Image preview */}
                <div className="mb-6 overflow-hidden rounded-2xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-auto w-full object-cover"
                    style={{ maxHeight: '500px' }}
                  />
                </div>

                {/* Bouton changer de photo */}
                <button
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    setResult(null);
                    setError('');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mb-6 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: '#5B8C5A' }}
                >
                  ← Changer de photo
                </button>

                {/* Bouton Identifier */}
                <button
                  onClick={handleIdentify}
                  disabled={loading}
                  className="w-full rounded-full px-6 py-4 text-center text-base font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  style={{
                    backgroundColor: loading ? '#CFD186' : '#5B8C5A',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(91, 140, 90, 0.3)',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Analyse en cours...
                    </span>
                  ) : (
                    '🔬 Identifier la plante'
                  )}
                </button>

                {/* Message d'erreur */}
                {error && (
                  <div
                    className="mt-4 rounded-xl p-4 text-sm"
                    style={{
                      backgroundColor: 'rgba(227, 101, 91, 0.1)',
                      color: '#E3655B',
                      border: '1px solid rgba(227, 101, 91, 0.2)',
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* RÉSULTAT IDENTIFICATION */
          <div
            className="rounded-3xl bg-white p-8"
            style={{ boxShadow: '0 8px 40px rgba(82, 65, 76, 0.08)' }}
          >
            {/* Image */}
            {imagePreview && (
              <div className="mb-6 overflow-hidden rounded-2xl">
                <img
                  src={imagePreview}
                  alt="Plante identifiée"
                  className="h-auto w-full object-cover"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )}

            {/* Message de succès */}
            <div className="mb-6 text-center">
              <div
                className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full text-3xl"
                style={{ backgroundColor: 'rgba(91, 140, 90, 0.15)' }}
              >
                ✅
              </div>
              <h2
                className="mb-2 font-serif font-bold"
                style={{ fontSize: '2rem', color: '#52414C' }}
              >
                Plante identifiée !
              </h2>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Ta plante a été ajoutée à ta collection
              </p>
            </div>

            {/* Informations de la plante */}
            <div
              className="mb-6 rounded-2xl p-6"
              style={{
                backgroundColor: '#F5F0E8',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#596157' }}>
                    Nom commun
                  </span>
                  <p className="mt-1 font-serif text-lg font-bold" style={{ color: '#52414C' }}>
                    {result.plant.common_name}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#596157' }}>
                    Nom scientifique
                  </span>
                  <p className="mt-1 text-sm italic" style={{ color: '#6B7280' }}>
                    {result.plant.scientific_name}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#596157' }}>
                    Famille
                  </span>
                  <p className="mt-1 text-sm uppercase tracking-wider" style={{ color: '#5B8C5A', opacity: 0.7 }}>
                    {result.plant.family}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#596157' }}>
                    Confiance
                  </span>
                  <p className="mt-1 text-sm font-semibold" style={{ color: '#5B8C5A' }}>
                    {result.plant.confidence}%
                  </p>
                </div>
              </div>
            </div>

            {/* XP gagnés */}
            {result.xpAwarded > 0 && (
              <div
                className="mb-6 rounded-xl px-4 py-3 text-center text-sm font-semibold"
                style={{
                  backgroundColor: 'rgba(207, 209, 134, 0.2)',
                  color: '#52414C',
                }}
              >
                ✨ +{result.xpAwarded} XP gagnés !
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/my-plants/${result.userPlant.id}`}
                className="flex-1 rounded-full px-6 py-3 text-center text-sm font-semibold text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: '#5B8C5A',
                  boxShadow: '0 4px 15px rgba(91, 140, 90, 0.3)',
                }}
              >
                Voir ma plante
              </Link>
              <Link
                href="/my-plants"
                className="flex-1 rounded-full border-2 px-6 py-3 text-center text-sm font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#5B8C5A',
                  color: '#5B8C5A',
                }}
              >
                Mes plantes
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
