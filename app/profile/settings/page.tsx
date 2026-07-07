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
  const [notifications, setNotifications] = useState({
    reservations: true,
    offers: true,
    events: true,
    sms: false,
  });

  return (
    <div className="animate-fade-up w-full max-w-3xl mx-auto pb-20 px-4 md:px-0">
      
      {/* SECTION 1: Notifications */}
      <div className="flex flex-col items-center mt-12 mb-10">
        <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--gold)] mb-3">
          NOTIFICATIONS
        </p>
        <h2 className="text-3xl font-serif text-[var(--foreground)] uppercase tracking-wide mb-6">
          HOW WE REACH YOU
        </h2>
        <div className="w-16 h-[1px] bg-[var(--gold)]/40 mb-10"></div>
        
        <div className="w-full bg-white border border-[var(--gold)]/20 shadow-sm flex flex-col px-8">
          
          <div className="flex justify-between items-center py-6 border-b border-[var(--gold)]/10">
            <span className="text-sm text-[var(--muted-foreground)] font-serif">Reservation confirmations &amp; reminders</span>
            <Toggle 
              isOn={notifications.reservations} 
              onToggle={() => setNotifications(s => ({ ...s, reservations: !s.reservations }))} 
            />
          </div>

          <div className="flex justify-between items-center py-6 border-b border-[var(--gold)]/10">
            <span className="text-sm text-[var(--muted-foreground)] font-serif">Exclusive offers from Kila</span>
            <Toggle 
              isOn={notifications.offers} 
              onToggle={() => setNotifications(s => ({ ...s, offers: !s.offers }))} 
            />
          </div>

          <div className="flex justify-between items-center py-6 border-b border-[var(--gold)]/10">
            <span className="text-sm text-[var(--muted-foreground)] font-serif">Cultural events at the palace</span>
            <Toggle 
              isOn={notifications.events} 
              onToggle={() => setNotifications(s => ({ ...s, events: !s.events }))} 
            />
          </div>

          <div className="flex justify-between items-center py-6">
            <span className="text-sm text-[var(--muted-foreground)] font-serif">SMS alerts</span>
            <Toggle 
              isOn={notifications.sms} 
              onToggle={() => setNotifications(s => ({ ...s, sms: !s.sms }))} 
            />
          </div>
          
        </div>
      </div>

      {/* SECTION 2: Security */}
      <div className="flex flex-col items-center mt-20 mb-10">
        <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--gold)] mb-3">
          SECURITY
        </p>
        <h2 className="text-3xl font-serif text-[var(--foreground)] uppercase tracking-wide mb-6">
          ACCOUNT &amp; PRIVACY
        </h2>
        <div className="w-16 h-[1px] bg-[var(--gold)]/40 mb-10"></div>
        
        <div className="w-full bg-white border border-[var(--gold)]/20 shadow-sm flex flex-col px-8">
          
          <div className="flex justify-between items-center py-6 border-b border-[var(--gold)]/10">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-[var(--foreground)] font-serif">Password</span>
              <span className="text-[11px] text-[var(--muted-foreground)] font-serif italic">Last changed 4 months ago</span>
            </div>
            <button className="text-[10px] uppercase tracking-widest text-[var(--gold)] font-medium hover:text-[#b58b44] transition-colors">
              UPDATE
            </button>
          </div>

          <div className="flex justify-between items-center py-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] text-[var(--foreground)] font-serif">Two-factor authentication</span>
              <span className="text-[11px] text-[var(--muted-foreground)] font-serif italic">Add an extra layer of protection</span>
            </div>
            <button className="text-[10px] uppercase tracking-widest text-[var(--gold)] font-medium hover:text-[#b58b44] transition-colors">
              ENABLE
            </button>
          </div>
          
        </div>
      </div>

      {/* Divider and Close Account */}
      <div className="mt-24 pt-10 border-t border-[var(--gold)]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-xl font-serif text-[var(--foreground)] mb-1">Close your account</h3>
          <p className="text-[11px] text-[var(--muted-foreground)] font-serif italic">
            Your reviews and history will be removed from Kila.
          </p>
        </div>
        <button className="px-6 py-2.5 border border-[#cc4b4b]/60 text-[#cc4b4b] bg-white text-[10px] uppercase tracking-widest font-medium hover:border-[#cc4b4b] transition-colors shadow-sm">
          CLOSE ACCOUNT
        </button>
      </div>

    </div>
  );
}
