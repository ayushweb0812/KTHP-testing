"use client";

import React from 'react';

export default function ReviewsPage() {
  return (
    <div className="p-8 md:p-10 animate-fade-up min-h-[500px] flex flex-col">
      <div className="mb-8 border-b border-[var(--gold)]/20 pb-6">
        <h2 className="text-2xl font-serif text-[var(--foreground)]">Reviews</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">Manage your past reviews and ratings.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center text-center border border-dashed border-[var(--gold)]/40 rounded-lg p-10">
        <svg className="w-16 h-16 text-[var(--gold)]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        <h3 className="text-xl font-serif text-[var(--foreground)] mb-2">No reviews yet</h3>
        <p className="text-[var(--muted-foreground)] mb-6 max-w-md">You haven't written any reviews for your stays. After your trip, you can share your experience here.</p>
      </div>
    </div>
  );
}
