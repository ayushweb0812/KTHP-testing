"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function PageTransitionOverlay({ 
  isTransitioning, 
  showLoader 
}: { 
  isTransitioning: boolean; 
  showLoader: boolean; 
}) {
  const [progress, setProgress] = useState(0);

  // Progress Bar Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTransitioning) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + (90 - prev) * 0.1; // Ease-out approaching 90%
        });
      }, 300);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500); // Wait for transition out before resetting width
      return () => clearTimeout(timeout);
    }
    return () => clearInterval(interval);
  }, [isTransitioning]);

  return (
    <>
      {/* Top Progress Bar */}
      <div 
        className={`fixed top-0 left-0 h-[3px] bg-[var(--gold)] z-[10000] transition-all ease-out ${isTransitioning ? 'opacity-100 duration-300' : progress === 0 ? 'opacity-0 duration-0' : 'opacity-0 duration-500 delay-300'}`}
        style={{ width: `${progress}%` }}
      />

      {/* Full Screen Glass Overlay */}
      <div 
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
          showLoader ? "opacity-100 backdrop-blur-md bg-black/20" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Bonus: Golden Particles */}
        <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${showLoader ? 'opacity-30' : 'opacity-0'}`}>
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>

        {/* Center Loader */}
        <div className={`relative flex flex-col items-center transition-transform duration-700 ease-out ${showLoader ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}>
          {/* Radial Glow */}
          <div className="absolute inset-0 bg-[var(--gold)]/30 blur-[70px] rounded-full w-48 h-48 -z-10 animate-pulse-slow"></div>
          
          {/* Pulsing Logo */}
          <div className="animate-pulse-slow relative w-24 h-24 md:w-32 md:h-32 mb-8">
            <Image src="/logo (1).svg" alt="Kothi Palace" fill className="object-contain drop-shadow-2xl" priority />
          </div>

          {/* Loading Text with dots */}
          <div className="text-center text-[var(--parchment)] font-serif tracking-widest text-sm md:text-base animate-pulse-slow flex items-center">
            Preparing your experience
            <span className="inline-block w-8 text-left overflow-hidden align-bottom">
              <span className="animate-typing-dots inline-block">...</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
