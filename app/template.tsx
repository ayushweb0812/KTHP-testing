"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
export default function Template({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

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
  }, { dependencies: [pathname] });

  return (
    <>
      {/* Transition Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] bg-maroon-deep flex items-center justify-center pointer-events-none"
        style={{ transform: "translateY(-100%)" }}
      >
        <img src="/logo (1).svg" alt="Kila" className="h-16 w-auto object-contain animate-pulse" />
      </div>

      {/* Page Content */}
      <main ref={contentRef} className="min-h-screen">
        {children}
      </main>
    </>
  );
}
