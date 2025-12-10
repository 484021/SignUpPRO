export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Main circle (center node) */}
      <circle cx="20" cy="20" r="5" fill="url(#logo-gradient)" />

      {/* Connecting lines */}
      <line x1="20" y1="20" x2="10" y2="10" stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="30" y2="10" stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="10" y2="30" stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="30" y2="30" stroke="url(#logo-gradient)" strokeWidth="2" strokeLinecap="round" />

      {/* Outer circles (connected nodes) */}
      <circle cx="10" cy="10" r="3" fill="url(#logo-gradient)" />
      <circle cx="30" cy="10" r="3" fill="url(#logo-gradient)" />
      <circle cx="10" cy="30" r="3" fill="url(#logo-gradient)" />
      <circle cx="30" cy="30" r="3" fill="url(#logo-gradient)" />
    </svg>
  )
}
