'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePocketBase } from '@/lib/contexts/PocketBaseContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PremiumGate } from '@/components/PremiumGate';
import { isPremium } from '@/lib/subscription';
import { SearchIcon, PlantIcon, BookIcon, SunIcon, WaterIcon, CompatibilityIcon } from '@/components/Icons';
import type { Plant } from '@/lib/types/pocketbase';

type SortOption = 'name' | 'family' | 'newest';
type FilterTag = 'all' | 'intérieur' | 'extérieur' | 'succulent' | 'aromatique' | 'fleurie';

const categoryConfig: Record<FilterTag, { label: string; icon: React.ComponentType<{ size?: number; color?: string }>; color: string; bgColor: string }> = {
  all: { label: 'Toutes', icon: PlantIcon, color: '#52414C', bgColor: 'rgba(82, 65, 76, 0.15)' },
  intérieur: { label: 'Intérieur', icon: PlantIcon, color: '#5B8C5A', bgColor: 'rgba(91, 140, 90, 0.15)' },
  extérieur: { label: 'Extérieur', icon: SunIcon, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)' },
  succulent: { label: 'Succulentes', icon: PlantIcon, color: '#CFD186', bgColor: 'rgba(207, 209, 134, 0.15)' },
  aromatique: { label: 'Aromatiques', icon: WaterIcon, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  fleurie: { label: 'Fleuries', icon: CompatibilityIcon, color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
};

export default function ByoomBasePage() {
  const { pb, user } = usePocketBase();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<FilterTag>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const userIsPremium = isPremium(user);

  useEffect(() => {
    loadPlants();
  }, [selectedTag]);

  // Ajouter une classe au body quand un modal est ouvert pour flouter la navbar
  useEffect(() => {
    if (showCategoriesModal || showFiltersModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showCategoriesModal, showFiltersModal]);

  const loadPlants = async () => {
    try {
      let filterQuery = '';

      if (selectedTag !== 'all') {
        filterQuery = `tags ~ "${selectedTag}"`;
      }

      const result = await pb.collection('plants').getList(1, 500, {
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

  // Filtrage et tri des plantes
  const filteredAndSortedPlants = useMemo(() => {
    let filtered = [...plants];

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (plant) =>
          plant.common_name?.toLowerCase().includes(query) ||
          plant.scientific_name?.toLowerCase().includes(query) ||
          plant.family?.toLowerCase().includes(query)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.common_name || '').localeCompare(b.common_name || '');
        case 'family':
          return (a.family || '').localeCompare(b.family || '');
        case 'newest':
          return new Date(b.created || '').getTime() - new Date(a.created || '').getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [plants, searchQuery, sortBy]);

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: plants.length,
      filtered: filteredAndSortedPlants.length,
      families: new Set(plants.map((p) => p.family).filter(Boolean)).size,
    };
  }, [plants, filteredAndSortedPlants]);

  // Compteur de filtres actifs
  const activeFiltersCount = (searchQuery ? 1 : 0);

  if (loading) {
    return <LoadingSpinner message="Chargement de la ByoomBase..." />;
  }

  if (!userIsPremium) {
    return (
      <PremiumGate 
        feature="Byoombase"
        description="Accède au catalogue complet de toutes les plantes avec fiches détaillées, fun facts et guides d'entretien experts."
      >
        <div style={{ height: '400px' }} />
      </PremiumGate>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}>
      <div className="mx-auto max-w-7xl px-3 py-4 md:px-8 md:py-8">
        {/* Header avec fond distinct */}
        <div className="mb-4 rounded-2xl p-4 md:mb-8 md:rounded-3xl md:p-8" style={{ backgroundColor: '#52414C' }}>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl md:h-12 md:w-12 md:rounded-2xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
              <BookIcon size={24} color="white" className="md:hidden" />
              <BookIcon size={28} color="white" className="hidden md:block" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-2xl font-bold text-white md:text-4xl">
                ByoomBase
              </h1>
              <p className="text-xs text-white opacity-90 md:text-base">
                {stats.total} plantes • {stats.families} familles
              </p>
            </div>
          </div>
        </div>

        {/* Barre de recherche - pleine largeur sur mobile */}
        <div className="mb-4 md:mb-6">
          <div className="rounded-2xl bg-white p-3 shadow-sm md:p-4" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 md:left-4">
                <SearchIcon size={18} color="#596157" className="md:w-5 md:h-5" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-none bg-gray-50 px-10 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5B8C5A] md:px-12 md:py-3.5 md:text-base"
                style={{
                  color: '#52414C',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-medium transition-colors hover:bg-gray-200 md:right-4"
                  style={{ color: '#596157' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Boutons Catégories et Filtres - en ligne sur mobile */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:mb-6 md:flex md:gap-3">
          {/* Bouton Catégories */}
          <button
            onClick={() => setShowCategoriesModal(true)}
            className="flex flex-col items-center justify-center rounded-2xl bg-white px-3 py-2.5 shadow-sm transition-all active:scale-95 md:min-w-[120px] md:px-4 md:py-3"
            style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
          >
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl md:mb-1.5 md:h-10 md:w-10" style={{ backgroundColor: '#5B8C5A' }}>
              <PlantIcon size={18} color="white" className="md:w-5 md:h-5" />
            </div>
            <div className="text-[10px] font-semibold md:text-xs" style={{ color: '#52414C' }}>
              Catégories
            </div>
            {selectedTag !== 'all' && (
              <div className="mt-0.5 h-1 w-1 rounded-full md:mt-1 md:h-1.5 md:w-1.5" style={{ backgroundColor: categoryConfig[selectedTag].color }} />
            )}
          </button>

          {/* Bouton Filtres */}
          <button
            onClick={() => setShowFiltersModal(true)}
            className="flex flex-col items-center justify-center rounded-2xl bg-white px-3 py-2.5 shadow-sm transition-all active:scale-95 md:min-w-[120px] md:px-4 md:py-3"
            style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)' }}
          >
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-xl md:mb-1.5 md:h-10 md:w-10" style={{ backgroundColor: '#CFD186' }}>
              <SearchIcon size={18} color="#52414C" className="md:w-5 md:h-5" />
            </div>
            <div className="text-[10px] font-semibold md:text-xs" style={{ color: '#52414C' }}>
              Filtres
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white md:mt-1 md:h-5 md:w-5 md:text-xs" style={{ backgroundColor: '#5B8C5A' }}>
                {activeFiltersCount}
              </div>
            )}
          </button>
        </div>

        {/* Modal Catégories */}
        {showCategoriesModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCategoriesModal(false)}
          >
            <div
              className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#5B8C5A' }}>
                    <PlantIcon size={24} color="white" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
                      Catégories
                    </h2>
                    <p className="text-sm" style={{ color: '#596157' }}>
                      Choisissez une catégorie de plantes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoriesModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: '#596157' }}
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {(['all', 'intérieur', 'extérieur', 'succulent', 'aromatique', 'fleurie'] as FilterTag[]).map((tag) => {
                  const config = categoryConfig[tag];
                  const Icon = config.icon;
                  const isSelected = selectedTag === tag;

                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setShowCategoriesModal(false);
                      }}
                      className="group relative rounded-2xl p-5 text-left transition-all hover:scale-105"
                      style={{
                        backgroundColor: isSelected ? config.bgColor : '#F5F0E8',
                        border: isSelected ? `2px solid ${config.color}` : '2px solid transparent',
                        boxShadow: isSelected ? `0 4px 16px ${config.color}30` : '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <div
                        className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl transition-all"
                        style={{
                          backgroundColor: isSelected ? config.color : 'white',
                          boxShadow: isSelected ? `0 4px 12px ${config.color}40` : '0 2px 6px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        <Icon size={28} color={isSelected ? 'white' : config.color} />
                      </div>
                      <div className="text-sm font-bold" style={{ color: isSelected ? config.color : '#52414C' }}>
                        {config.label}
                      </div>
                      {isSelected && (
                        <div className="absolute right-3 top-3 h-3 w-3 rounded-full" style={{ backgroundColor: config.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal Filtres */}
        {showFiltersModal && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowFiltersModal(false)}
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#CFD186' }}>
                    <SearchIcon size={24} color="#52414C" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold" style={{ color: '#52414C' }}>
                      Filtres avancés
                    </h2>
                    <p className="text-sm" style={{ color: '#596157' }}>
                      {activeFiltersCount > 0 ? `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''}` : 'Aucun filtre actif'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: '#596157' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Tri */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#F5F0E8' }}>
                  <label className="mb-3 block text-sm font-semibold uppercase tracking-wide" style={{ color: '#52414C' }}>
                    Trier par
                  </label>
                  <div className="space-y-2">
                    {(['name', 'family', 'newest'] as SortOption[]).map((option) => {
                      const labels: Record<SortOption, string> = {
                        name: 'Nom (A-Z)',
                        family: 'Famille',
                        newest: 'Plus récentes',
                      };
                      return (
                        <button
                          key={option}
                          onClick={() => setSortBy(option)}
                          className="w-full rounded-lg border-none px-4 py-3 text-left text-sm font-medium transition-all"
                          style={{
                            backgroundColor: sortBy === option ? '#5B8C5A' : 'white',
                            color: sortBy === option ? 'white' : '#52414C',
                            boxShadow: sortBy === option ? '0 2px 8px rgba(91, 140, 90, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          {labels[option]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#F5F0E8' }}>
                  <label className="mb-3 block text-sm font-semibold uppercase tracking-wide" style={{ color: '#52414C' }}>
                    Résultats
                  </label>
                  <div className="rounded-xl bg-white p-5 shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
                    <div className="mb-3 text-center">
                      <div className="font-serif text-4xl font-bold" style={{ color: '#5B8C5A' }}>
                        {filteredAndSortedPlants.length}
                      </div>
                      <div className="text-sm font-medium" style={{ color: '#596157' }}>
                        résultat{filteredAndSortedPlants.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm" style={{ color: '#596157' }}>
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="font-semibold" style={{ color: '#52414C' }}>{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Familles</span>
                        <span className="font-semibold" style={{ color: '#52414C' }}>{stats.families}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grille de plantes */}
        {filteredAndSortedPlants.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4">
            {filteredAndSortedPlants.map((plant) => {
              const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
              const imageUrl = plant.cover_image 
                ? `${pbUrl}/api/files/plants/${plant.id}/${plant.cover_image}`
                : null;

              return (
                <Link
                  key={plant.id}
                  href={`/byoombase/${plant.id}`}
                  className="group rounded-xl bg-white transition-all active:scale-[0.98] md:rounded-2xl md:hover:scale-[1.02] md:hover:shadow-lg"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-100 md:rounded-t-2xl">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={plant.common_name || 'Plante'}
                        className="h-full w-full object-cover transition-transform duration-300 md:group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="flex h-full items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #5B8C5A 0%, #CFD186 100%)',
                        }}
                      >
                        <span className="text-4xl md:text-6xl">🌿</span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-2.5 md:p-4">
                    <h3 className="mb-0.5 line-clamp-1 font-serif text-sm font-bold md:mb-1 md:text-lg" style={{ color: '#52414C' }}>
                      {plant.common_name || 'Sans nom'}
                    </h3>
                    {plant.family && (
                      <p className="text-[9px] font-medium uppercase tracking-wide md:text-xs" style={{ color: '#5B8C5A' }}>
                        {plant.family}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div className="mb-4 flex justify-center">
              <SearchIcon size={64} color="#CFD186" />
            </div>
            <h2 className="mb-2 font-serif text-xl font-bold" style={{ color: '#52414C' }}>
              Aucune plante trouvée
            </h2>
            <p className="text-sm" style={{ color: '#596157' }}>
              {searchQuery || difficultyFilter !== null
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucune plante dans cette catégorie'}
            </p>
            {(searchQuery || difficultyFilter !== null) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter(null);
                }}
                className="mt-4 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#5B8C5A' }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
