"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {IMAGES.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={`Kila The Heritage Palace — heritage palace in Satna, slide ${idx + 1}`}
          fill
          priority={idx === 0}
          quality={80}
          sizes="100vw"
          className={`absolute inset-0 object-cover ken-burns transition-opacity duration-[2000ms] ease-in-out ${
            idx === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[oklch(0.14_0.04_30/0.45)] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-vignette)" }} />
    </div>
  );
}
