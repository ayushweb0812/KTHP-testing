// Server Component — no "use client" needed (pure SVG, no hooks)

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 12 H42" stroke="currentColor" strokeWidth="0.8" />
      <path d="M78 12 H120" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="60" cy="12" r="3" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="60" cy="12" r="6" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      <path d="M48 12 L54 8 L54 16 Z" fill="currentColor" opacity="0.7" />
      <path d="M72 12 L66 8 L66 16 Z" fill="currentColor" opacity="0.7" />
      <circle cx="42" cy="12" r="1.2" fill="currentColor" />
      <circle cx="78" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function ArchOrnament({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none" aria-hidden="true">
      <path
        d="M10 78 V40 Q10 10 100 10 Q190 10 190 40 V78"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M22 78 V42 Q22 22 100 22 Q178 22 178 42 V78"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.6"
        fill="none"
      />
      <circle cx="100" cy="14" r="2.5" fill="currentColor" />
    </svg>
  );
}
