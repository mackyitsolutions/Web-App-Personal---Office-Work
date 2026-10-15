import React from 'react';

interface FlagProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Official Flag of Laos (ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ)
 * Proportions: Red (1), Blue (2), Red (1) with centered White Moon disc
 */
export const LaoFlag: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 overflow-hidden rounded-[2.5px] shadow-2xs border border-black/10 dark:border-white/10 ${className}`}
      aria-label="Flag of Laos"
      role="img"
    >
      {/* Top Red stripe */}
      <rect width="60" height="10" fill="#CE1126" />
      {/* Center Deep Navy Blue stripe */}
      <rect y="10" width="60" height="20" fill="#002868" />
      {/* Bottom Red stripe */}
      <rect y="30" width="60" height="10" fill="#CE1126" />
      {/* Centered White Circle (Full Moon) */}
      <circle cx="30" cy="20" r="8" fill="#FFFFFF" />
    </svg>
  );
};

/**
 * Official Flag of the United Kingdom (Union Jack)
 * Accurate vector paths with crisp St. George & St. Andrew/St. Patrick crosses
 */
export const UKFlag: React.FC<FlagProps> = ({ className = 'w-5 h-3.5' }) => {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`inline-block shrink-0 overflow-hidden rounded-[2.5px] shadow-2xs border border-black/10 dark:border-white/10 ${className}`}
      aria-label="Flag of the United Kingdom"
      role="img"
    >
      <defs>
        <clipPath id="uk-clip-bounds">
          <rect width="60" height="40" />
        </clipPath>
      </defs>
      <g clipPath="url(#uk-clip-bounds)">
        {/* Deep blue background */}
        <rect width="60" height="40" fill="#012169" />
        {/* White saltire base */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
        {/* Red saltire counterchanged */}
        <path
          d="M0,0 L30,20 M60,40 L30,20"
          stroke="#C8102E"
          strokeWidth="3.2"
        />
        <path
          d="M60,0 L30,20 M0,40 L30,20"
          stroke="#C8102E"
          strokeWidth="3.2"
        />
        {/* White broad cross */}
        <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="12" />
        {/* Red center cross */}
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
};
