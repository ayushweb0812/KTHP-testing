"use client";

import React, { createContext, useContext, useState, useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageTransitionOverlay from "./PageTransitionOverlay";

interface TransitionContextType {
  isTransitioning: boolean;
  beginPageTransition: () => void;
  finishPageTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isTransitioning: false,
  beginPageTransition: () => {},
  finishPageTransition: () => {},
});

export const useTransition = () => useContext(TransitionContext);

function RouteChangeListener({ finishPageTransition }: { finishPageTransition: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Force scroll to top when pathname changes, using timeout to wait for DOM/Next.js updates
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    finishPageTransition();
  }, [pathname, searchParams]);

  return null;
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center top");
  
  const loaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const failsafeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeouts = () => {
    if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current);
    if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
  };

  const finishPageTransition = () => {
    clearTimeouts();
    setIsTransitioning(false);
    setShowLoader(false);
    
    // Restore body background
    if (typeof window !== "undefined") {
      setTimeout(() => {
        document.body.style.backgroundColor = "";
      }, 500); // Wait for transition out
    }
  };

  const beginPageTransition = () => {
    if (isTransitioning) return; // Prevent multiple concurrent transitions
    
    setIsTransitioning(true);
    
    // Set dynamic transform origin based on current scroll position
    if (typeof window !== "undefined") {
      const scrollY = window.scrollY;
      const viewportCenterY = scrollY + window.innerHeight / 2;
      setTransformOrigin(`center ${viewportCenterY}px`);
      
      // Optional: Set body background to black so any scaled edges blend with the overlay
      document.body.style.backgroundColor = "#000000";
    }

    // Delay loader appearance to prevent flashing on fast navigations
    loaderTimeoutRef.current = setTimeout(() => {
      setShowLoader(true);
    }, 120);

    // Fail-safe to remove loader if navigation hangs (e.g. 8 seconds)
    failsafeTimeoutRef.current = setTimeout(() => {
      finishPageTransition();
    }, 8000);
  };

  useEffect(() => {
    return clearTimeouts;
  }, []);

  return (
    <TransitionContext.Provider value={{ isTransitioning, beginPageTransition, finishPageTransition }}>
      <Suspense fallback={null}>
        <RouteChangeListener finishPageTransition={finishPageTransition} />
      </Suspense>

      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] w-full min-h-screen ${
          isTransitioning ? "scale-[0.98] blur-[4px] opacity-90" : "scale-100 blur-0 opacity-100"
        }`}
        style={{ transformOrigin }}
      >
        {children}
      </div>
      
      <PageTransitionOverlay isTransitioning={isTransitioning} showLoader={showLoader} />
    </TransitionContext.Provider>
  );
}
