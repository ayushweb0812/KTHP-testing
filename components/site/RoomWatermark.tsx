import React from "react";

export function RoomWatermark() {
  return (
    <div className="w-full h-full bg-[var(--gold)]/10 flex flex-col items-center justify-center select-none pointer-events-none absolute inset-0">
      <img src="/logo (1).svg" alt="Kila The Heritage Palace" className="h-28 w-auto object-contain opacity-60" />
    </div>
  );
}
