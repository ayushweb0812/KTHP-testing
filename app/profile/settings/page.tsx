"use client";

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="p-8 md:p-10 animate-fade-up">
      {/* Page Header */}
      <div className="mb-8 border-b border-[var(--gold)]/20 pb-6">
        <h2 className="text-2xl font-serif text-[var(--foreground)]">Settings</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">Manage your account security, communication preferences, and data display settings here.</p>
      </div>

      <div className="space-y-12">
        {/* Remove Account Section */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-1">Remove Account</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Delete your account through settings for complete removal of your data from the system.
              </p>
            </div>
            <button className="whitespace-nowrap px-6 py-2 border border-red-500 text-red-500 bg-transparent text-sm font-medium hover:bg-red-500 hover:text-white transition-colors rounded-md">
              Delete Account
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[color-mix(in_oklab,var(--gold)_30%,transparent)]" />

        {/* Preferences & Display Section */}
        <div>
          <h2 className="text-xl font-serif text-[var(--foreground)] mb-8">Preferences & Display</h2>
          
          <div className="space-y-8">
            {/* Currency */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Default Currency</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Set the preferred currency for displaying room rates and transaction costs.
                </p>
              </div>
              <div className="w-full md:w-64">
                <select className="w-full input-royal bg-transparent rounded-md appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20fill=%22none%22%20stroke=%22%23cba052%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%222%22%20viewBox=%220%200%2024%2024%22><path%20d=%22M6%209l6%206%206-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center] pr-10">
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                </select>
              </div>
            </div>

            {/* Language */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Language Preference</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Select the preferred language for the website interface.
                </p>
              </div>
              <div className="w-full md:w-64">
                <select className="w-full input-royal bg-transparent rounded-md appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20fill=%22none%22%20stroke=%22%23cba052%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%222%22%20viewBox=%220%200%2024%2024%22><path%20d=%22M6%209l6%206%206-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center] pr-10">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            {/* Date Format */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="font-medium text-[var(--foreground)] mb-1">Date Format</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Choose how dates are displayed across the site.
                </p>
              </div>
              <div className="w-full md:w-64">
                <select className="w-full input-royal bg-transparent rounded-md appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20fill=%22none%22%20stroke=%22%23cba052%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%222%22%20viewBox=%220%200%2024%2024%22><path%20d=%22M6%209l6%206%206-6%22/></svg>')] bg-no-repeat bg-[position:right_1rem_center] pr-10">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
