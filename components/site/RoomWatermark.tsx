import React from "react";

export function RoomWatermark() {
  return (
    <div className="w-full h-full bg-[var(--gold)]/10 flex flex-col items-center justify-center select-none pointer-events-none absolute inset-0">
      <div className="w-20 h-20 rounded-full border-2 border-[var(--gold)]/30 flex items-center justify-center mb-4">
        <span className="text-[var(--gold)]/80 text-display text-4xl mt-1">क</span>
      </div>
      <div className="text-center leading-none">
        <div className="text-[var(--gold)]/80 text-display text-xl tracking-widest">KILA</div>
        <div className="text-[8px] uppercase tracking-[0.32em] text-[var(--gold)]/60 mt-2">
          The Heritage Palace
        </div>
      </div>
    </div>
  );
}
