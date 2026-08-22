import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const LogoIcon: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 select-none ${className}`}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="cb-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="cb-deep-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Main Neon Gradients */}
        <linearGradient id="cb-grad-cloud" x1="12" y1="18" x2="88" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="45%" stopColor="#00f2fe" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="cb-grad-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d172e" />
          <stop offset="100%" stopColor="#050a14" />
        </linearGradient>

        <linearGradient id="cb-grad-glow" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#00f2fe" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id="cb-grad-visor" x1="30" y1="40" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#061124" />
          <stop offset="100%" stopColor="#020712" />
        </linearGradient>
      </defs>

      {/* Cyber Squircle Badge Backplate with Neon Gradient Rim */}
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="24"
        fill="url(#cb-grad-bg)"
        stroke="url(#cb-grad-cloud)"
        strokeWidth="2.5"
      />

      {/* Ambient Internal Glow */}
      <circle cx="50" cy="52" r="28" fill="url(#cb-grad-glow)" filter="url(#cb-deep-glow)" />

      {/* Top Antenna / Signal Transmitter */}
      <path d="M50 26 L50 14" stroke="url(#cb-grad-cloud)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="13" r="4.5" fill="#00f2fe" filter="url(#cb-glow)" />
      <circle cx="50" cy="13" r="2" fill="#ffffff" />
      <path d="M39 10 A 13 13 0 0 1 61 10" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />

      {/* Main Cloud Outer Contour */}
      <path
        d="M26 68 C16 68 11 58 15 48 C18 39 26 36 34 35 C38 23 50 18 63 22 C72 25 78 33 80 41 C89 42 93 50 91 59 C89 67 82 68 74 68 Z"
        fill="url(#cb-grad-cloud)"
        filter="url(#cb-glow)"
      />

      {/* Bot Screen Visor (Cutout Dark Cyber Glass) */}
      <rect
        x="27"
        y="42"
        width="46"
        height="22"
        rx="7"
        fill="url(#cb-grad-visor)"
        stroke="#00f2fe"
        strokeWidth="1.8"
      />

      {/* Glowing Cyan/Emerald LED Eyes */}
      <rect x="34.5" y="47.5" width="9" height="10" rx="3" fill="#00f2fe" filter="url(#cb-glow)" />
      <rect x="36.5" y="49" width="4.5" height="5" rx="1.5" fill="#ffffff" />

      <rect x="56.5" y="47.5" width="9" height="10" rx="3" fill="#00f2fe" filter="url(#cb-glow)" />
      <rect x="58.5" y="49" width="4.5" height="5" rx="1.5" fill="#ffffff" />

      {/* Friendly Voice Pulse */}
      <path d="M46 60 Q50 63 54 60" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />

      {/* Cloud Server / Hosting Connection Pulse Line at the bottom */}
      <path d="M37 77 Q50 83 63 77" stroke="url(#cb-grad-cloud)" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <circle cx="50" cy="86" r="3" fill="#00f2fe" filter="url(#cb-glow)" />
      <circle cx="37" cy="84" r="2" fill="#10b981" opacity="0.9" />
      <circle cx="63" cy="84" r="2" fill="#3b82f6" opacity="0.9" />
    </svg>
  );
};

export const LogoFull: React.FC<LogoProps & { showSub?: boolean; vertical?: boolean }> = ({ 
  size = 32, 
  showSub = false,
  vertical = false,
  className = ''
}) => {
  if (vertical) {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <LogoIcon size={size * 1.3} />
        <div className="mt-2">
          <h1 className="text-2xl font-black text-white tracking-wider uppercase leading-none font-sans">
            CLOUD<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#00f2fe]">BOT</span>
          </h1>
          {showSub && (
            <p className="text-[10px] text-zinc-400 tracking-widest uppercase mt-1 font-mono">
              24/7 Cloud Hosting
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      <div className="flex flex-col">
        <h1 className="text-xl font-black text-white tracking-wider uppercase leading-none font-sans">
          CLOUD<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-[#00f2fe]">BOT</span>
        </h1>
        {showSub && (
          <p className="text-[9.5px] text-zinc-400 tracking-widest uppercase mt-1 font-mono">
            24/7 Cloud Hosting
          </p>
        )}
      </div>
    </div>
  );
};



