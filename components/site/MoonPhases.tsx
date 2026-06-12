// Server Component — pure CSS animation, no hooks needed

type Props = {
  className?: string;
  opacity?: number;
  duration?: number;
  count?: number;
  size?: number;
  direction?: "ltr" | "rtl";
};

const PHASES = [
  { sx: 0, sr: 0 },
  { sx: 6, sr: 12 },
  { sx: 10, sr: 12 },
  { sx: 14, sr: 12 },
  { sx: 0, sr: 12 },
  { sx: -14, sr: 12 },
  { sx: -10, sr: 12 },
  { sx: -6, sr: 12 },
];

export function MoonPhases({
  className = "",
  opacity = 0.16,
  duration = 60,
  count = 10,
  size = 56,
  direction = "ltr",
}: Props) {
  const moons = Array.from({ length: count }, (_, i) => PHASES[i % PHASES.length]);
  const strip = [...moons, ...moons];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
      style={{ opacity }}
    >
      <div
        className="absolute inset-0 flex items-center gap-[10vw] whitespace-nowrap"
        style={{
          width: "200%",
          animation: `moonDrift ${duration}s linear infinite`,
          animationDirection: direction === "rtl" ? "reverse" : "normal",
          color: "var(--gold)",
        }}
      >
        {strip.map((p, i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="-20 -20 40 40"
            className="shrink-0 moon-pulse"
            style={{ animationDelay: `${(i % count) * (duration / count) * 0.18}s` }}
          >
            <defs>
              <radialGradient id={`mg-${i}`} cx="35%" cy="35%" r="70%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
              </radialGradient>
              <mask id={`moon-mask-${i}`}>
                <rect x="-20" y="-20" width="40" height="40" fill="white" />
                {p.sr > 0 && (
                  <circle cx={p.sx} cy="0" r={p.sr} fill="black" />
                )}
              </mask>
            </defs>
            <g mask={`url(#moon-mask-${i})`}>
              <circle cx="0" cy="0" r="18" fill="currentColor" opacity="0.08" />
              <circle cx="0" cy="0" r="12" fill={`url(#mg-${i})`} />
            </g>
            <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
          </svg>
        ))}
      </div>
    </div>
  );
}
