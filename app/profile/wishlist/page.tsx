"use client";

import React from 'react';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

export default function WishlistPage() {
  return (
    <div className="p-8 md:p-10 animate-fade-up min-h-[500px] flex flex-col">
      <div className="mb-8 border-b border-[var(--gold)]/20 pb-6">
        <h2 className="text-2xl font-serif text-[var(--foreground)]">Wishlist</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">View and manage your saved properties.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center border border-dashed border-[var(--gold)]/40 rounded-lg p-10">
        <svg className="w-16 h-16 text-[var(--gold)]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        <h3 className="text-xl font-serif text-[var(--foreground)] mb-2">Your wishlist is empty</h3>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md">You haven't saved any properties yet. Start exploring our heritage palaces and save your favorites.</p>
        <Link href="/" className="px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] transition-all rounded shadow-md">
          Explore Palaces
        </Link>
      </div>
    </div>
  );
}
