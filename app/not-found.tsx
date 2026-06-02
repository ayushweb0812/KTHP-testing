import Link from "next/link";

// app/not-found.tsx — replaces NotFoundComponent from __root.tsx
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 paper-grain">
      <div className="max-w-md text-center">
        <p className="eyebrow">Lost in the corridors</p>
        <h1 className="text-display text-8xl mt-6 gold-text">404</h1>
        <p className="mt-6 text-muted-foreground font-serif text-lg">
          This chamber does not exist within the palace.
        </p>
        <Link
          href="/"
          className="inline-flex mt-8 px-8 py-3 border border-[var(--gold)] text-[var(--maroon)] text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon)] hover:text-parchment transition-all"
        >
          Return to the Palace
        </Link>
      </div>
    </div>
  );
}
