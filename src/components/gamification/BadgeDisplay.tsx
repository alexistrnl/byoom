'use client';

interface BadgeDisplayProps {
  badges: string[];
  size?: 'sm' | 'md' | 'lg';
}

const badgeIcons: Record<string, string> = {
  first_plant: '🌱',
  detective: '🔍',
  collector: '🏆',
  streak_7: '🔥',
  streak_30: '🔥🔥',
  photographer: '📸',
  chef: '👨‍🍳',
  bonsai: '🌳',
  healer: '💚',
  architect: '🤝',
};

const badgeNames: Record<string, string> = {
  first_plant: 'Première Pousse',
  detective: 'Détective Vert',
  collector: 'Collectionneur',
  streak_7: 'Streak Master',
  streak_30: 'Streak Légendaire',
  photographer: 'Photographe',
  chef: 'Chef Botaniste',
  bonsai: 'Bonsaïste',
  healer: 'Soignant',
  architect: 'Architecte du Jardin',
};

export function BadgeDisplay({ badges, size = 'md' }: BadgeDisplayProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  if (!badges || badges.length === 0) {
    return (
      <div className="text-sm text-gray-500">Aucun badge</div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badgeId) => (
        <div
          key={badgeId}
          className={`${sizeClasses[size]} rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-300`}
          title={badgeNames[badgeId] || badgeId}
        >
          {badgeIcons[badgeId] || '🏅'}
        </div>
      ))}
    </div>
  );
}
