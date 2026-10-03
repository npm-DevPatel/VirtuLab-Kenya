/**
 * Lab apparatus line-art SVG illustrations.
 * Single-color, flat, clean line art — ink or subject color.
 * No 3D, no gradients, no gloss.
 */

/** Hero illustration — burette + conical flask titration setup */
export function HeroIllustration({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 440"
      fill="none"
      aria-label="Line drawing of a titration setup: burette above a conical flask on a stand"
      role="img"
    >
      {/* Retort stand base */}
      <rect x="40" y="400" width="160" height="8" rx="2" stroke="#1E1B16" strokeWidth="1.8" fill="#FAF7F0"/>
      {/* Vertical rod */}
      <rect x="100" y="120" width="6" height="288" rx="2" stroke="#1E1B16" strokeWidth="1.8" fill="#FAF7F0"/>
      {/* Horizontal clamp arm */}
      <rect x="100" y="138" width="80" height="5" rx="2" stroke="#1E1B16" strokeWidth="1.8" fill="#FAF7F0"/>
      {/* Clamp */}
      <rect x="168" y="128" width="12" height="25" rx="2" stroke="#1E1B16" strokeWidth="1.8" fill="#FAF7F0"/>

      {/* Burette body */}
      <rect x="174" y="120" width="16" height="200" rx="3" stroke="#1E1B16" strokeWidth="1.8" fill="rgba(30,110,79,0.06)"/>
      {/* Burette graduation marks */}
      <line x1="183" y1="140" x2="190" y2="140" stroke="#1E1B16" strokeWidth="1"/>
      <line x1="183" y1="160" x2="190" y2="160" stroke="#1E1B16" strokeWidth="1"/>
      <line x1="183" y1="180" x2="190" y2="180" stroke="#1E1B16" strokeWidth="1"/>
      <line x1="183" y1="200" x2="190" y2="200" stroke="#1E1B16" strokeWidth="1"/>
      <line x1="183" y1="220" x2="190" y2="220" stroke="#1E1B16" strokeWidth="1"/>
      <line x1="183" y1="240" x2="190" y2="240" stroke="#1E1B16" strokeWidth="1"/>
      <line x1="183" y1="260" x2="190" y2="260" stroke="#1E1B16" strokeWidth="1"/>
      {/* Burette tip */}
      <path d="M179 320 L182 338 L182 348 L182 358" stroke="#1E1B16" strokeWidth="1.6" strokeLinecap="round"/>
      {/* Tap */}
      <rect x="173" y="314" width="18" height="8" rx="2" stroke="#1E1B16" strokeWidth="1.6" fill="#FAF7F0"/>
      <line x1="168" y1="318" x2="173" y2="318" stroke="#1E1B16" strokeWidth="2" strokeLinecap="round"/>

      {/* Conical flask */}
      <path
        d="M152 360 L140 390 Q136 408 148 412 H220 Q232 408 228 390 L216 360 Z"
        stroke="#1E1B16" strokeWidth="1.8" fill="rgba(180,69,42,0.06)" strokeLinejoin="round"
      />
      {/* Flask neck */}
      <rect x="166" y="340" width="32" height="22" rx="2" stroke="#1E1B16" strokeWidth="1.8" fill="rgba(30,110,79,0.06)"/>
      {/* Solution level in flask */}
      <path d="M143 395 Q184 388 225 395" stroke="#B4452A" strokeWidth="1.2" strokeDasharray="4 2"/>
      {/* Drop from burette */}
      <ellipse cx="182" cy="362" rx="2" ry="3" fill="#1F6E4F" opacity="0.6"/>

      {/* White tile under flask */}
      <rect x="130" y="412" width="108" height="8" rx="1" stroke="#1E1B16" strokeWidth="1.4" fill="#FAF7F0"/>

      {/* Second clamp arm — lower */}
      <rect x="100" y="340" width="55" height="4" rx="2" stroke="#1E1B16" strokeWidth="1.5" fill="#FAF7F0"/>

      {/* Bench line */}
      <line x1="20" y1="420" x2="340" y2="420" stroke="#1E1B16" strokeWidth="1" opacity="0.15"/>

      {/* Ammeter (decorative, physics) — off to side */}
      <circle cx="295" cy="200" r="36" stroke="#2A5B8C" strokeWidth="1.6" fill="rgba(42,91,140,0.04)"/>
      <text x="295" y="196" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#2A5B8C" opacity="0.7">A</text>
      <line x1="259" y1="200" x2="245" y2="200" stroke="#2A5B8C" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="331" y1="200" x2="345" y2="200" stroke="#2A5B8C" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M275 218 Q295 230 315 218" stroke="#2A5B8C" strokeWidth="1" fill="none" opacity="0.5"/>

      {/* Leaf — biology */}
      <path
        d="M50 280 Q90 230 130 260 Q100 310 50 280 Z"
        stroke="#5B7A3A" strokeWidth="1.6" fill="rgba(91,122,58,0.06)"
      />
      <line x1="50" y1="280" x2="120" y2="262" stroke="#5B7A3A" strokeWidth="1" opacity="0.5"/>
      <line x1="75" y1="274" x2="80" y2="288" stroke="#5B7A3A" strokeWidth="0.9" opacity="0.4"/>
      <line x1="90" y1="268" x2="96" y2="283" stroke="#5B7A3A" strokeWidth="0.9" opacity="0.4"/>
      <line x1="105" y1="265" x2="109" y2="278" stroke="#5B7A3A" strokeWidth="0.9" opacity="0.4"/>
    </svg>
  );
}

/** Chemistry section — flask icon */
export function ChemistryIcon({ size = 48, color = '#B4452A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="19" y="4" width="10" height="14" rx="2" stroke={color} strokeWidth="1.8"/>
      <path d="M19 18 L8 40 Q7 43 10 43 H38 Q41 43 40 40 L29 18 Z"
        stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <ellipse cx="22" cy="33" rx="3" ry="2" fill={color} opacity="0.2"/>
      <ellipse cx="30" cy="36" rx="2" ry="1.5" fill={color} opacity="0.2"/>
      <line x1="16" y1="30" x2="32" y2="30" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
    </svg>
  );
}

/** Physics section — circuit/ammeter icon */
export function PhysicsIcon({ size = 48, color = '#2A5B8C' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1.8"/>
      <text x="24" y="29" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="13" fill={color} fontWeight="500">A</text>
      <line x1="4" y1="24" x2="10" y2="24" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="38" y1="24" x2="44" y2="24" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="24" x2="4" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="44" y1="24" x2="44" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="4" y1="12" x2="44" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Cell symbol on top wire */}
      <line x1="20" y1="10" x2="20" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="28" y1="9" x2="28" y2="15" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/** Biology section — leaf/microscope icon */
export function BiologyIcon({ size = 48, color = '#5B7A3A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Microscope body */}
      <rect x="19" y="8" width="10" height="16" rx="2" stroke={color} strokeWidth="1.8"/>
      {/* Eyepiece */}
      <rect x="21" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth="1.6"/>
      {/* Arm */}
      <line x1="24" y1="24" x2="24" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* Objective */}
      <ellipse cx="24" cy="37" rx="4" ry="2" stroke={color} strokeWidth="1.6"/>
      {/* Stage */}
      <rect x="14" y="38" width="20" height="4" rx="1" stroke={color} strokeWidth="1.6"/>
      {/* Base */}
      <rect x="12" y="42" width="24" height="3" rx="1" stroke={color} strokeWidth="1.6"/>
      {/* Leaf accent */}
      <path d="M32 20 Q42 14 40 24 Q36 28 32 20 Z" stroke={color} strokeWidth="1.4" fill="none" opacity="0.5"/>
    </svg>
  );
}
