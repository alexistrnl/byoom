'use client';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message = 'Chargement...', size = 'md' }: LoadingSpinnerProps) {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ backgroundColor: '#F5F0E8', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animation de plante qui pousse */}
        <div className="relative" style={{ width: '100px', height: '100px' }}>
          {/* Pot */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-lg"
            style={{
              width: '60px',
              height: '40px',
              backgroundColor: '#8B6F47',
              borderTop: '3px solid #6B5233',
            }}
          />
          
          {/* Plante animée */}
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            style={{
              animation: 'plantGrow 1.5s ease-in-out infinite',
            }}
          >
            <div
              className="inline-block"
              style={{
                fontSize: '3.5rem',
                animation: 'plantBounce 1s ease-in-out infinite',
                animationDelay: '0.2s',
              }}
            >
              🌿
            </div>
          </div>

          {/* Particules de croissance */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#5B8C5A',
                bottom: '50px',
                left: `${50 + (i - 1) * 15}%`,
                animation: `particleFloat 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Texte avec animation pulse */}
        <p
          className={`font-medium ${textSizes[size]}`}
          style={{
            color: '#52414C',
            animation: 'textPulse 2s ease-in-out infinite',
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
