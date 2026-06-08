"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Template({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Slide curtain UP to reveal the page
    tl.fromTo(overlayRef.current, 
      { yPercent: 0 },
      { yPercent: -100, duration: 1.2, ease: "power4.inOut" }
    )
    // Slide and fade content IN
    .fromTo(
      contentRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.8"
    );

    // --- PAGE EXIT ANIMATION ---
    let isExiting = false;
    const handleExit = () => {
      if (isExiting) return;
      isExiting = true;

      if (overlayRef.current) {
        // Bring curtain UP from the bottom
        gsap.fromTo(overlayRef.current,
          { yPercent: 100 },
          { yPercent: 0, duration: 0.8, ease: "power4.inOut" }
        );
      }
      
      if (contentRef.current) {
        // Fade and slide content OUT
        gsap.to(contentRef.current, {
          y: -40, opacity: 0, duration: 0.8, ease: "power3.inOut"
        });
      }
    };

    window.addEventListener("page-exit", handleExit);

    return () => {
      window.removeEventListener("page-exit", handleExit);
    };
  });

  return (
    <>
      {/* Transition Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-maroon-deep flex items-center justify-center pointer-events-none"
      >
        <div className="w-16 h-16 rounded-full border border-gold/60 flex items-center justify-center">
          <span className="text-gold text-display text-3xl animate-pulse">क</span>
        </div>
      </div>

      {/* Page Content */}
      <main ref={contentRef} className="min-h-screen">
        {children}
      </main>
    </>
  );
}
