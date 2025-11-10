'use client'

export function ChristmasGarland() {
  return (
    <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-10 overflow-hidden">
      {/* Guirlande verte en haut */}
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
        >
          {/* Ligne de guirlande verte */}
          <path
            d="M 0 40 Q 150 20, 300 40 T 600 40 T 900 40 T 1200 40"
            stroke="#0d7d4d"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Aiguilles de pin */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <path
                d={`M ${i * 60} 40 L ${i * 60 - 5} 30 L ${i * 60 + 5} 30 Z`}
                fill="#0d7d4d"
              />
              <path
                d={`M ${i * 60} 40 L ${i * 60 - 4} 35 L ${i * 60 + 4} 35 Z`}
                fill="#0d7d4d"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Étoiles dorées suspendues */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = (i * 80) % 1200
        const delay = i * 0.2
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(x / 1200) * 100}%`,
              top: '45px',
              animation: `swing ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="rgba(255, 255, 255, 0.9)"
                stroke="#0d7d4d"
                strokeWidth="0.5"
              />
            </svg>
          </div>
        )
      })}

      {/* Ornements suspendus */}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = (i * 150 + 75) % 1200
        const delay = i * 0.3
        return (
          <div
            key={`ornament-${i}`}
            className="absolute"
            style={{
              left: `${(x / 1200) * 100}%`,
              top: '50px',
              animation: `swing ${4 + (i % 2)}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <div
              className="w-4 h-4 rounded-full border-2"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(13,125,77,0.8) 100%)',
                borderColor: '#0d7d4d',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              }}
            />
          </div>
        )
      })}

      <style jsx>{`
        @keyframes swing {
          0%, 100% {
            transform: rotate(-5deg) translateY(0);
          }
          50% {
            transform: rotate(5deg) translateY(5px);
          }
        }
      `}</style>
    </div>
  )
}

