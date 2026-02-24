'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlantIcon, SearchIcon } from '@/components/Icons';
import type { Plant } from '@/lib/types/pocketbase';

export default function AdminPlantsPage() {
  const { pb, user, loading } = usePocketBase();
  const router = useRouter();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Attendre que le loading soit terminé
    if (loading) return;
    
    // Si pas de user → login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Vérifier l'email admin
    const ADMIN_EMAILS = ['contact@byoom.fr', 'alexistrnl@gmail.com'];
    console.log('User email:', user.email); // debug
    if (!ADMIN_EMAILS.includes(user.email)) {
      router.push('/dashboard');
      return;
    }
    
    // C'est un admin, charger les plantes
    loadPlants();
  }, [loading, user, page]);

  const loadPlants = async () => {
    try {
      setLoadingPlants(true);
      const response = await fetch(`/api/admin/plants?page=${page}&perPage=50`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      setPlants(data.items as unknown as Plant[]);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingPlants(false);
    }
  };

  const handleEdit = (plant: Plant) => {
    setEditingPlant(plant);
    setFormData({
      common_name: plant.common_name || '',
      scientific_name: plant.scientific_name || '',
      family: plant.family || '',
      history: (plant as any).history || '',
      uses: (plant as any).uses || '',
      fun_facts: typeof (plant as any).fun_facts === 'string' 
        ? (plant as any).fun_facts 
        : (plant as any).fun_facts || '',
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingPlant(null);
    setFormData({
      common_name: '',
      scientific_name: '',
      family: '',
      history: '',
      uses: '',
      fun_facts: '',
    });
    setShowForm(true);
  };

  const compressImage = async (file: File, maxSizeMB = 0.5): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Redimensionner si trop grande
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg'
            }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.7); // qualité 70%
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach((key) => {
        if (key !== 'cover_image') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const coverImageInput = document.getElementById('cover_image') as HTMLInputElement;
      if (coverImageInput?.files?.[0]) {
        const compressed = await compressImage(coverImageInput.files[0]);
        console.log('Image compressée:', compressed.size, 'bytes');
        formDataToSend.append('cover_image', compressed);
      }

      const url = editingPlant
        ? `/api/admin/plants/${editingPlant.id}`
        : '/api/admin/plants';
      const method = editingPlant ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setShowForm(false);
      setEditingPlant(null);
      loadPlants();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette plante ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/plants/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      loadPlants();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
    }
  };

  // Pendant le chargement ne pas rediriger
  if (loading) {
    return <LoadingSpinner message="Chargement..." />;
  }

  // Si pas de user après le chargement, on sera redirigé par le useEffect
  if (!user) {
    return <LoadingSpinner message="Vérification..." />;
  }

  // Si pas admin, on sera redirigé par le useEffect
  const ADMIN_EMAILS = ['contact@byoom.fr', 'alexistrnl@gmail.com'];
  if (!ADMIN_EMAILS.includes(user.email)) {
    return <LoadingSpinner message="Redirection..." />;
  }

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

  // Filtrer les plantes selon la recherche
  const filteredPlants = useMemo(() => {
    if (!searchQuery.trim()) {
      return plants;
    }
    
    const query = searchQuery.toLowerCase();
    return plants.filter((plant) => {
      const commonName = plant.common_name?.toLowerCase() || '';
      const scientificName = plant.scientific_name?.toLowerCase() || '';
      const family = plant.family?.toLowerCase() || '';
      
      return (
        commonName.includes(query) ||
        scientificName.includes(query) ||
        family.includes(query)
      );
    });
  }, [plants, searchQuery]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 font-serif text-3xl font-bold" style={{ color: '#52414C' }}>
              Administration - Plantes
            </h1>
            <p className="text-sm" style={{ color: '#596157' }}>
              Gérer le catalogue de plantes
            </p>
          </div>
          <button
            onClick={handleNew}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: '#5B8C5A' }}
          >
            + Ajouter une plante
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <SearchIcon size={20} color="#596157" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une plante (nom, scientifique, famille)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-sm focus:border-5B8C5A focus:outline-none focus:ring-2 focus:ring-5B8C5A focus:ring-opacity-20"
              style={{ color: '#52414C' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm" style={{ color: '#596157' }}>
              {filteredPlants.length} résultat{filteredPlants.length > 1 ? 's' : ''} trouvé{filteredPlants.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Formulaire modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowForm(false)}
          >
            <div
              className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
                  {editingPlant ? 'Éditer la plante' : 'Nouvelle plante'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: '#596157' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Nom commun *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.common_name}
                      onChange={(e) => setFormData({ ...formData, common_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Nom scientifique *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.scientific_name}
                      onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Famille *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.family}
                      onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Histoire & Origine
                  </label>
                  <textarea
                    value={formData.history}
                    onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Utilité
                  </label>
                  <textarea
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Fun Facts
                  </label>
                  <textarea
                    value={formData.fun_facts}
                    onChange={(e) => setFormData({ ...formData, fun_facts: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Photo de couverture
                  </label>
                  <input
                    id="cover_image"
                    type="file"
                    accept="image/*"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all"
                    style={{ backgroundColor: '#F5F0E8', color: '#52414C' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                    style={{ backgroundColor: '#5B8C5A' }}
                  >
                    {uploading ? 'Enregistrement...' : editingPlant ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Liste des plantes */}
        <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
          {loadingPlants ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner message="Chargement des plantes..." />
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold" style={{ color: '#52414C' }}>
                {searchQuery ? 'Aucune plante trouvée' : 'Aucune plante'}
              </p>
              <p className="mt-2 text-sm" style={{ color: '#596157' }}>
                {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter une plante'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlants.map((plant) => {
              const imageUrl = plant.cover_image
                ? `${pbUrl}/api/files/plants/${plant.id}/${plant.cover_image}`
                : null;

              return (
                <div
                  key={plant.id}
                  className="rounded-xl border border-gray-200 p-4 transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex items-start gap-3">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={plant.common_name || 'Plante'}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, #5B8C5A 0%, #CFD186 100%)',
                        }}
                      >
                        <PlantIcon size={32} color="white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#52414C' }}>
                        {plant.common_name}
                      </h3>
                      <p className="text-xs italic" style={{ color: '#596157' }}>
                        {plant.scientific_name}
                      </p>
                      {plant.family && (
                        <p className="mt-1 text-xs" style={{ color: '#596157' }}>
                          {plant.family}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plant)}
                      className="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: '#5B8C5A' }}
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(plant.id)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ backgroundColor: '#E3655B' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {/* Pagination - Masquée pendant la recherche */}
          {!searchQuery && totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: page === 1 ? '#F5F0E8' : '#5B8C5A',
                  color: page === 1 ? '#596157' : 'white',
                }}
              >
                Précédent
              </button>
              <span className="flex items-center px-4 text-sm" style={{ color: '#596157' }}>
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: page === totalPages ? '#F5F0E8' : '#5B8C5A',
                  color: page === totalPages ? '#596157' : 'white',
                }}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
