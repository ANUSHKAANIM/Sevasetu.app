export function BridgeIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      className={className}
      role="img"
      aria-label="An illustration of a bridge connecting a home to a service professional, representing SevaSetu, the Bridge of Service"
    >
      {/* soft depth blob */}
      <circle cx="250" cy="195" r="175" fill="var(--color-secondary)" opacity="0.6" />

      {/* sparkle accents */}
      <circle cx="95" cy="70" r="5" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="405" cy="95" r="4" fill="var(--color-accent)" opacity="0.6" />
      <circle cx="360" cy="55" r="3" fill="var(--color-primary)" opacity="0.5" />
      <circle cx="130" cy="115" r="3" fill="var(--color-primary)" opacity="0.4" />

      {/* ground platforms */}
      <rect x="40" y="262" width="160" height="18" rx="9" fill="var(--color-secondary)" />
      <rect x="300" y="262" width="160" height="18" rx="9" fill="var(--color-secondary)" />

      {/* bridge suspension cable */}
      <path
        d="M150 258 Q250 148 350 258"
        stroke="var(--color-accent)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      {/* cable supports */}
      <line x1="190" y1="199" x2="190" y2="253" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <line x1="250" y1="180" x2="250" y2="253" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <line x1="310" y1="199" x2="310" y2="253" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />

      {/* bridge deck */}
      <rect x="145" y="253" width="210" height="12" rx="6" fill="var(--color-primary)" />

      {/* house, left platform */}
      <g transform="translate(70,178)">
        <path d="M0 42 L40 10 L80 42 Z" fill="var(--color-primary)" />
        <rect x="10" y="42" width="60" height="46" rx="4" fill="var(--color-primary)" />
        <rect x="32" y="60" width="16" height="28" rx="2" fill="var(--color-background)" />
        <rect x="52" y="56" width="12" height="12" rx="2" fill="var(--color-accent)" />
      </g>

      {/* friendly figure, right platform */}
      <g transform="translate(370,178)">
        <circle cx="30" cy="20" r="16" fill="var(--color-accent)" />
        <path
          d="M2 88 C2 58 14 44 30 44 C46 44 58 58 58 88 Z"
          fill="var(--color-accent)"
        />
        {/* raised, waving arm */}
        <path
          d="M12 58 Q-8 46 -14 22"
          stroke="var(--color-accent)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="-14" cy="20" r="7.5" fill="var(--color-accent)" />
      </g>

      {/* base line */}
      <line x1="20" y1="288" x2="480" y2="288" stroke="var(--color-border)" strokeWidth="2" />
    </svg>
  );
}
