'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { getPocketBaseClient } from '@/lib/pocketbase';

export default function IdentifyPage() {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCapture = (file: File) => {
    setImage(file);
    setResult(null);
    setError('');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-[var(--color-night)]">
          🔍 Identifier une plante
        </h1>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <CameraCapture onCapture={handleCapture} />

          {image && (
            <div className="mt-6">
              <div className="mb-4">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>

              {!result && (
                <button
                  onClick={handleIdentify}
                  disabled={loading}
                  className="w-full rounded-md bg-[var(--color-moss)] px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Analyse en cours...' : 'Identifier la plante'}
                </button>
              )}

              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-6 rounded-lg bg-green-50 p-6">
                  <h2 className="mb-4 text-xl font-bold text-[var(--color-night)]">
                    Plante identifiée !
                  </h2>
                  <div className="space-y-2">
                    <div>
                      <span className="font-semibold">Nom commun:</span>{' '}
                      {result.plant.common_name}
                    </div>
                    <div>
                      <span className="font-semibold">Nom scientifique:</span>{' '}
                      {result.plant.scientific_name}
                    </div>
                    <div>
                      <span className="font-semibold">Famille:</span>{' '}
                      {result.plant.family}
                    </div>
                    <div>
                      <span className="font-semibold">Confiance:</span>{' '}
                      {result.plant.confidence}%
                    </div>
                    {result.xpAwarded > 0 && (
                      <div className="mt-4 rounded-md bg-yellow-100 p-3 text-sm text-yellow-800">
                        ✨ +{result.xpAwarded} XP gagnés !
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <a
                      href={`/pokedex/${result.plant.id}`}
                      className="rounded-md bg-[var(--color-moss)] px-4 py-2 text-white hover:opacity-90"
                    >
                      Voir la fiche
                    </a>
                    <a
                      href="/dashboard"
                      className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Retour au dashboard
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
