"use client";

import React, { useState } from 'react';

// Reusable toggle component
function Toggle({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors duration-300 ${
        isOn ? 'bg-[#cba052]' : 'bg-gray-200'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full absolute transition-transform duration-300 shadow-sm ${
          isOn ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto py-32 px-4 md:px-0 text-center">
      <h2 className="text-3xl font-serif text-[var(--gold)] uppercase tracking-wide mb-6">
        Settings
      </h2>
      <div className="w-16 h-[1px] bg-[var(--gold)]/40 mb-10 mx-auto"></div>
      <p className="text-[var(--muted-foreground)] font-serif text-lg">
        This section is currently under development. Please check back later.
      </p>
    </div>
  );
}
/* Commented out original UI:

  const [notifications, setNotifications] = useState({
    reservations: true,
    offers: true,
    events: true,
    sms: false,
  });

  return (
    ... original code omitted ...
  );
*/
