"use client";

import { useState, useEffect } from "react";

const IMAGES = [
  "/Hero screen/image1.png",
  "/Hero screen/image2.png",
  "/Hero screen/image3.png",
  "/Hero screen/image4.png",
];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {IMAGES.map((src, idx) => (
        <img
          key={src}
          src={src}
          alt={`Kila Heritage Palace Slide ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover ken-burns transition-opacity duration-[2000ms] ease-in-out ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[oklch(0.14_0.04_30/0.45)] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-vignette)" }} />
    </div>
  );
}
