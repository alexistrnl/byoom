'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlantIcon, StarIcon } from '@/components/Icons';
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
      brief_description: (plant as any).brief_description || '',
      history: (plant as any).history || '',
      uses: (plant as any).uses || '',
      difficulty: plant.difficulty || 1,
      watering_frequency: plant.watering_frequency || '',
      light_needs: plant.light_needs || 'moyen',
      soil_type: plant.soil_type || '',
      temperature_min: plant.temperature_min || 15,
      temperature_max: plant.temperature_max || 25,
      humidity: plant.humidity || 'moyen',
      edible: plant.edible || false,
      toxic_to_pets: plant.toxic_to_pets || false,
      toxic_to_humans: plant.toxic_to_humans || false,
      bonsai_compatible: plant.bonsai_compatible || false,
      fun_facts: JSON.stringify((plant as any).fun_facts || []),
      tags: JSON.stringify(plant.tags || []),
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingPlant(null);
    setFormData({
      common_name: '',
      scientific_name: '',
      family: '',
      brief_description: '',
      history: '',
      uses: '',
      difficulty: 1,
      watering_frequency: '',
      light_needs: 'moyen',
      soil_type: '',
      temperature_min: 15,
      temperature_max: 25,
      humidity: 'moyen',
      edible: false,
      toxic_to_pets: false,
      toxic_to_humans: false,
      bonsai_compatible: false,
      fun_facts: '[]',
      tags: '[]',
    });
    setShowForm(true);
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
        formDataToSend.append('cover_image', coverImageInput.files[0]);
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
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
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Difficulté (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Description brève
                  </label>
                  <textarea
                    value={formData.brief_description}
                    onChange={(e) => setFormData({ ...formData, brief_description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
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
                    Utilisations (médicinale, culinaire, décorative)
                  </label>
                  <textarea
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Arrosage
                    </label>
                    <input
                      type="text"
                      value={formData.watering_frequency}
                      onChange={(e) => setFormData({ ...formData, watering_frequency: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Lumière
                    </label>
                    <select
                      value={formData.light_needs}
                      onChange={(e) => setFormData({ ...formData, light_needs: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="faible">Faible</option>
                      <option value="moyen">Moyen</option>
                      <option value="fort">Fort</option>
                      <option value="direct">Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Terreau
                    </label>
                    <input
                      type="text"
                      value={formData.soil_type}
                      onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Humidité
                    </label>
                    <select
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    >
                      <option value="faible">Faible</option>
                      <option value="moyen">Moyen</option>
                      <option value="élevé">Élevé</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Température min (°C)
                    </label>
                    <input
                      type="number"
                      value={formData.temperature_min}
                      onChange={(e) => setFormData({ ...formData, temperature_min: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                      Température max (°C)
                    </label>
                    <input
                      type="number"
                      value={formData.temperature_max}
                      onChange={(e) => setFormData({ ...formData, temperature_max: parseInt(e.target.value) })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Fun Facts (JSON array, ex: ["Fact 1", "Fact 2"])
                  </label>
                  <textarea
                    value={formData.fun_facts}
                    onChange={(e) => setFormData({ ...formData, fun_facts: e.target.value })}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm"
                    placeholder='["Fact 1", "Fact 2"]'
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: '#52414C' }}>
                    Tags (JSON array ou séparés par virgules)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    placeholder='["intérieur", "fleurie"] ou intérieur, fleurie'
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.edible}
                      onChange={(e) => setFormData({ ...formData, edible: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: '#52414C' }}>Comestible</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.toxic_to_pets}
                      onChange={(e) => setFormData({ ...formData, toxic_to_pets: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: '#52414C' }}>Toxique animaux</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.toxic_to_humans}
                      onChange={(e) => setFormData({ ...formData, toxic_to_humans: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: '#52414C' }}>Toxique humains</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.bonsai_compatible}
                      onChange={(e) => setFormData({ ...formData, bonsai_compatible: e.target.checked })}
                    />
                    <span className="text-sm" style={{ color: '#52414C' }}>Bonsaï</span>
                  </label>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plants.map((plant) => {
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
                      <div className="mt-1 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <StarIcon
                            key={level}
                            size={12}
                            color="#F59E0B"
                            filled={level <= (plant.difficulty || 1)}
                          />
                        ))}
                      </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
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
