"use client";

import React from 'react';

export default function PaymentAccountPage() {
  return (
    <div className="p-8 md:p-10 animate-fade-up">
      {/* Page Header */}
      <div className="mb-8 border-b border-[var(--gold)]/20 pb-6">
        <h2 className="text-2xl font-serif text-[var(--foreground)]">Payment methods</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">Securely add or remove payment methods to make it easier when you book.</p>
      </div>

      <div className="space-y-8">
        {/* Payment Methods Box */}
        <div className="bg-[var(--background)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] rounded-xl overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-medium text-[var(--foreground)] flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Payment methods
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Add a payment method using our secure payment system, then start planning your next trip.
              </p>
            </div>
            <button className="whitespace-nowrap px-6 py-2 border border-[var(--gold)] text-[var(--gold)] bg-transparent text-sm font-medium hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-colors rounded-md">
              Add payment method
            </button>
          </div>
          <div className="border-t border-[color-mix(in_oklab,var(--gold)_30%,transparent)]" />
          
          {/* Gift Credit Box */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-medium text-[var(--foreground)] flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Kila gift credit
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Add gift credits to your Kila account to enhance your travel experience.
              </p>
            </div>
            <button className="whitespace-nowrap px-6 py-2 border border-[var(--gold)] text-[var(--gold)] bg-transparent text-sm font-medium hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-colors rounded-md">
              Add gift card
            </button>
          </div>
        </div>

        {/* Coupons Section */}
        <div>
          <h2 className="text-xl font-serif text-[var(--foreground)] mb-4">Coupons</h2>
          <div className="bg-[var(--background)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-medium text-[var(--foreground)] flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Your coupons
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                0 active coupons
              </p>
            </div>
            <button className="whitespace-nowrap px-6 py-2 border border-[var(--gold)] text-[var(--gold)] bg-transparent text-sm font-medium hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-colors rounded-md">
              Add coupons
            </button>
          </div>
        </div>

        {/* Support Footer */}
        <div className="bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl p-6 mt-12">
          <h4 className="font-medium text-[var(--foreground)] mb-2">Need help with payments?</h4>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Contact our support team for any payment-related questions or issues.
          </p>
          <button className="text-[var(--gold)] text-sm font-medium hover:underline">
            Contact Support &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
