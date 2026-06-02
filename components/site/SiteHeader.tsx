"use client";

// Client Component: uses useState + useEffect for scroll/mobile-menu state.
// Also uses usePathname() to replicate TanStack Router's activeProps behavior.

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Heritage" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!getAccessToken());
    };
    checkAuth();
    // Optional: listen for storage changes across tabs
    window.addEventListener('storage', checkAuth);

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[oklch(0.16_0.06_258/0.85)] backdrop-blur-md border-b border-gold/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full border border-gold/60 flex items-center justify-center group-hover:rotate-12 transition-transform duration-700">
            <span className="text-gold text-display text-xl">क</span>
          </div>
          <div className="leading-none">
            <div className="text-gold text-display text-2xl tracking-wide">KILA</div>
            <div className="text-[10px] uppercase tracking-[0.32em] text-parchment/70">
              The Heritage Palace
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`text-sm uppercase tracking-[0.28em] transition-colors ${
                pathname === n.href
                  ? "text-gold"
                  : "text-parchment/85 hover:text-gold"
              }`}
            >
              {n.label}
            </Link>
          ))}
            <Link
              href="/reserve"
              className="ml-4 px-6 py-2.5 border border-gold text-gold text-xs uppercase tracking-[0.32em] hover:bg-gold hover:text-maroon-deep transition-all duration-500"
            >
              Reserve
            </Link>
            {isAuthenticated ? (
              <Link
                href="/profile"
                className="text-sm uppercase tracking-[0.28em] text-parchment/85 hover:text-gold transition-colors ml-4"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm uppercase tracking-[0.28em] text-parchment/85 hover:text-gold transition-colors ml-4"
              >
                Sign In
              </Link>
            )}
          </nav>

        <button
          className="md:hidden text-parchment p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[oklch(0.16_0.06_258/0.97)] backdrop-blur-md border-t border-gold/20">
          <div className="px-6 py-6 flex flex-col gap-5">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="text-parchment text-sm uppercase tracking-[0.28em]"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/reserve"
              onClick={() => setOpen(false)}
              className="px-6 py-3 border border-gold text-gold text-xs uppercase tracking-[0.32em] text-center"
            >
              Reserve
            </Link>
            {isAuthenticated ? (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="px-6 py-3 text-parchment text-sm uppercase tracking-[0.28em] border border-parchment/20 text-center"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-6 py-3 text-parchment text-sm uppercase tracking-[0.28em] border border-parchment/20 text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
