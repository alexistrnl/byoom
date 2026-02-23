import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const SearchIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="7.5" />
    <path d="m20 20-4.5-4.5" strokeWidth="1.5" />
    <circle cx="11" cy="11" r="3" fill={color} opacity="0.2" />
  </svg>
);

export const MicroscopeIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 18h9" strokeWidth="1.5" />
    <path d="M2 22h14" strokeWidth="1.5" />
    <ellipse cx="15" cy="22" rx="2" ry="1" fill={color} opacity="0.15" />
    <path d="M15 22a7 7 0 1 0 0-14" strokeWidth="1.5" />
    <path d="M10 14h2" strokeWidth="1.5" />
    <path d="M10 12a2.5 2.5 0 0 1-2.5-2.5V5h5v4.5A2.5 2.5 0 0 1 10 12Z" strokeWidth="1.5" />
    <rect x="9" y="2" width="3" height="3" rx="0.5" strokeWidth="1.5" />
    <circle cx="10.5" cy="3.5" r="0.5" fill={color} />
    <path d="M12 5v2" strokeWidth="1.5" />
  </svg>
);

export const PlantIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v20" strokeWidth="1.5" />
    <path d="M12 2c3 0 6 2 6 6s-3 6-6 6" strokeWidth="1.5" />
    <path d="M12 2c-3 0-6 2-6 6s3 6 6 6" strokeWidth="1.5" />
    <circle cx="12" cy="8" r="1.5" fill={color} opacity="0.3" />
    <path d="M8 14c2 2 4 2 6 0" strokeWidth="1.5" />
    <path d="M16 14c-2 2-4 2-6 0" strokeWidth="1.5" />
    <path d="M10 18c1 1 2 1 4 0" strokeWidth="1.5" />
    <path d="M14 18c-1 1-2 1-4 0" strokeWidth="1.5" />
  </svg>
);

export const BookIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" strokeWidth="1.5" />
    <path d="M6.5 2v18" strokeWidth="1.5" />
    <line x1="9" y1="6" x2="18" y2="6" strokeWidth="1.5" />
    <line x1="9" y1="10" x2="18" y2="10" strokeWidth="1.5" />
    <line x1="9" y1="14" x2="15" y2="14" strokeWidth="1.5" />
    <circle cx="12" cy="8" r="0.5" fill={color} opacity="0.4" />
    <circle cx="12" cy="12" r="0.5" fill={color} opacity="0.4" />
  </svg>
);

export const ScissorsIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="6" cy="6" r="2.5" strokeWidth="1.5" />
    <circle cx="6" cy="18" r="2.5" strokeWidth="1.5" />
    <circle cx="6" cy="6" r="1" fill={color} opacity="0.3" />
    <circle cx="6" cy="18" r="1" fill={color} opacity="0.3" />
    <path d="M20 4L8.5 15.5" strokeWidth="1.5" />
    <path d="M14.5 14.5 20 20" strokeWidth="1.5" />
    <path d="M8.5 8.5 12 12" strokeWidth="1.5" />
    <path d="M20 20L8.5 8.5" strokeWidth="1.5" />
    <path d="M14.5 9.5 20 4" strokeWidth="1.5" />
  </svg>
);

export const CompatibilityIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" />
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} opacity="0.1" />
    <path d="M12 8.5c-1-1.5-3-2-4.5-1s-2 2.5-1.5 4c0.5 1.5 2 3 4.5 4.5" strokeWidth="1.5" opacity="0.4" />
    <path d="M12 8.5c1-1.5 3-2 4.5-1s2 2.5 1.5 4c-0.5 1.5-2 3-4.5 4.5" strokeWidth="1.5" opacity="0.4" />
    <circle cx="12" cy="10" r="1" fill={color} opacity="0.3" />
    <circle cx="9" cy="9" r="0.8" fill={color} opacity="0.2" />
    <circle cx="15" cy="9" r="0.8" fill={color} opacity="0.2" />
  </svg>
);

export const WaterIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21a10 10 0 1 0-10-10" strokeWidth="1.5" />
    <path d="M12 11v10" strokeWidth="1.5" />
    <path d="M8 11h8" strokeWidth="1.5" />
    <ellipse cx="12" cy="11" rx="4" ry="2" fill={color} opacity="0.15" />
    <path d="M10 9c0-1 1-2 2-2s2 1 2 2" strokeWidth="1.5" />
    <circle cx="12" cy="9" r="0.5" fill={color} />
  </svg>
);

export const SunIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4" fill={color} opacity="0.2" />
    <circle cx="12" cy="12" r="2" fill={color} opacity="0.4" />
    <path d="M12 2v2" strokeWidth="1.5" />
    <path d="M12 20v2" strokeWidth="1.5" />
    <path d="m4.93 4.93 1.41 1.41" strokeWidth="1.5" />
    <path d="m17.66 17.66 1.41 1.41" strokeWidth="1.5" />
    <path d="M2 12h2" strokeWidth="1.5" />
    <path d="M20 12h2" strokeWidth="1.5" />
    <path d="m6.34 17.66-1.41 1.41" strokeWidth="1.5" />
    <path d="m19.07 4.93-1.41 1.41" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

export const TemperatureIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" strokeWidth="1.5" />
    <rect x="12" y="2" width="2" height="2" rx="0.5" fill={color} opacity="0.3" />
    <path d="M12 6v2" strokeWidth="1.5" />
    <path d="M12 10v2" strokeWidth="1.5" />
    <circle cx="12" cy="16" r="2" fill={color} opacity="0.15" />
    <circle cx="12" cy="16" r="1" fill={color} />
  </svg>
);

export const HumidityIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" strokeWidth="1.5" />
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill={color} opacity="0.1" />
    <circle cx="12" cy="8" r="1.5" fill={color} opacity="0.3" />
    <circle cx="10" cy="10" r="1" fill={color} opacity="0.2" />
    <circle cx="14" cy="10" r="1" fill={color} opacity="0.2" />
    <path d="M8 12c1 1 2 2 4 2s3-1 4-2" strokeWidth="1.5" />
  </svg>
);

export const SoilIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2L2 7l10 5 10-5z" strokeWidth="1.5" />
    <path d="M2 17l10 5 10-5" strokeWidth="1.5" />
    <path d="M2 12l10 5 10-5" strokeWidth="1.5" />
    <circle cx="7" cy="7" r="0.8" fill={color} opacity="0.4" />
    <circle cx="12" cy="12" r="0.8" fill={color} opacity="0.4" />
    <circle cx="17" cy="17" r="0.8" fill={color} opacity="0.4" />
    <circle cx="7" cy="12" r="0.6" fill={color} opacity="0.3" />
    <circle cx="17" cy="12" r="0.6" fill={color} opacity="0.3" />
    <path d="M12 2v20" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

export const StarIcon = ({ className = '', size = 24, color = 'currentColor', filled = false }: IconProps & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    {!filled && (
      <>
        <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.3" />
        <path d="M12 6v2" strokeWidth="1.5" opacity="0.5" />
        <path d="M12 16v2" strokeWidth="1.5" opacity="0.5" />
      </>
    )}
  </svg>
);

export const CheckCircleIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" fill={color} opacity="0.1" />
    <path d="M8 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </svg>
);

export const AlertCircleIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="7" fill={color} opacity="0.1" />
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
    <circle cx="12" cy="16" r="1" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.3" />
  </svg>
);

export const TrashIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" strokeWidth="1.5" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="1.5" />
    <rect x="9" y="4" width="6" height="2" rx="0.5" fill={color} opacity="0.2" />
    <line x1="10" y1="10" x2="10" y2="16" strokeWidth="1.5" />
    <line x1="14" y1="10" x2="14" y2="16" strokeWidth="1.5" />
    <path d="M8 6h8" strokeWidth="1.5" opacity="0.3" />
  </svg>
);

export const LeafIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" strokeWidth="1.5" />
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill={color} opacity="0.1" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" strokeWidth="1.5" />
    <path d="M11 6c-1 2-2 4-2 6" strokeWidth="1.5" />
    <path d="M15 8c1 1 2 3 2 5" strokeWidth="1.5" />
    <circle cx="13" cy="10" r="0.8" fill={color} opacity="0.3" />
    <circle cx="17" cy="12" r="0.8" fill={color} opacity="0.3" />
  </svg>
);

export const MoonIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="1.5" />
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} opacity="0.15" />
    <circle cx="16" cy="8" r="1" fill={color} opacity="0.4" />
    <circle cx="18" cy="12" r="0.8" fill={color} opacity="0.3" />
    <circle cx="15" cy="15" r="0.6" fill={color} opacity="0.2" />
  </svg>
);

export const LightbulbIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21h6" strokeWidth="1.5" />
    <path d="M12 3a6 6 0 0 0 6 6c0 4-6 10-6 10S6 13 6 9a6 6 0 0 0 6-6Z" strokeWidth="1.5" />
    <path d="M12 3a6 6 0 0 0 6 6c0 4-6 10-6 10S6 13 6 9a6 6 0 0 0 6-6Z" fill={color} opacity="0.1" />
    <path d="M12 17v-4" strokeWidth="1.5" />
    <circle cx="12" cy="9" r="1.5" fill={color} opacity="0.3" />
    <path d="M10 11c1 1 2 1 4 0" strokeWidth="1.5" opacity="0.5" />
    <line x1="9" y1="21" x2="15" y2="21" strokeWidth="2" />
  </svg>
);

export const ArrowRightIcon = ({ className = '', size = 24, color = 'currentColor' }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" strokeWidth="1.5" />
    <polyline points="12 5 19 12 12 19" strokeWidth="1.5" />
    <circle cx="19" cy="12" r="1.5" fill={color} opacity="0.3" />
  </svg>
);
