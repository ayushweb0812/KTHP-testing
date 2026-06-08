"use client";

// Client Component: uses useState + useEffect for scroll/mobile-menu state.
// Also uses usePathname() to replicate TanStack Router's activeProps behavior.

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/api";
import { EnquiryModal } from "./EnquiryModal";
import { LoginModal } from "./LoginModal";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Heritage" },
  { href: "/profile/trips", label: "Bookings" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modals state
  const [loginOpen, setLoginOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!getAccessToken());
    };
    checkAuth();
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
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
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
              <div className="text-[10px] uppercase tracking-[0.32em] text-gold/70">
                The Heritage Palace
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm tracking-wide transition-colors duration-500 font-medium ${pathname === n.href || (pathname?.startsWith('/profile') && n.href === '/profile/trips')
                    ? "text-gold border-b border-gold pb-1"
                    : "text-gold/80 hover:text-gold"
                  }`}
              >
                {n.label}
              </Link>
            ))}

            <div className="flex items-center gap-4 ml-2">
              <button
                onClick={() => setEnquiryOpen(true)}
                className="px-6 py-2.5 border border-gold text-gold text-sm font-medium hover:bg-gold hover:text-maroon-deep transition-all duration-500 rounded"
              >
                Inquire Now
              </button>

              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className="w-10 h-10 bg-gold text-maroon-deep flex items-center justify-center rounded-full hover:bg-gold-soft transition-all duration-500 shadow-md ml-2"
                  aria-label="Profile"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-6 py-2.5 bg-gold text-maroon-deep text-sm font-medium hover:bg-gold-soft transition-all duration-500 rounded shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </nav>

          <button
            className="md:hidden p-2 transition-colors duration-500 text-gold"
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
                  className="text-parchment text-sm tracking-wide"
                >
                  {n.label}
                </Link>
              ))}
              <button
                onClick={() => { setOpen(false); setEnquiryOpen(true); }}
                className="px-6 py-3 border border-gold text-gold text-sm tracking-wide text-center rounded"
              >
                Inquire Now
              </button>
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 bg-gold text-maroon-deep text-sm tracking-wide text-center rounded shadow-md flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </Link>
              ) : (
                <button
                  onClick={() => { setOpen(false); setLoginOpen(true); }}
                  className="px-6 py-3 bg-gold text-maroon-deep text-sm tracking-wide text-center rounded shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} enquiryType="General Enquiry" />
    </>
  );
}
