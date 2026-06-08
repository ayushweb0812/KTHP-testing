"use client";

import React, { useEffect, useState } from 'react';
import { authApi, User } from '@/lib/api/auth';

export default function PersonalDetailsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countryCode, setCountryCode] = useState('+91');

  const phoneValidationRules: Record<string, { pattern: string, maxLength: number, placeholder: string }> = {
    '+91': { pattern: '[0-9]{10}', maxLength: 10, placeholder: 'Enter 10-digit number' },
    '+1': { pattern: '[0-9]{10}', maxLength: 10, placeholder: 'Enter 10-digit number' },
    '+44': { pattern: '[0-9]{10,11}', maxLength: 11, placeholder: 'Enter 10-11 digit number' },
    '+61': { pattern: '[0-9]{9}', maxLength: 9, placeholder: 'Enter 9-digit number' },
  };
  
  const currentPhoneRules = phoneValidationRules[countryCode] || phoneValidationRules['+91'];

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        if (mounted && res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchProfile();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 md:p-10 animate-fade-up">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-[var(--maroon)] text-[var(--gold)] flex items-center justify-center text-3xl font-serif shadow-[var(--shadow-gold)]">
          {user?.first_name ? user.first_name[0].toUpperCase() : 'G'}
        </div>
        <div>
          <h2 className="text-2xl font-serif text-[var(--foreground)]">My Profile</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">You'll see real-time information and activities of your profile here</p>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              First Name
            </label>
            <input 
              type="text" 
              defaultValue={user?.first_name || ''}
              className="input-royal bg-transparent rounded-md" 
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Last Name
            </label>
            <input 
              type="text" 
              defaultValue={user?.last_name || ''}
              className="input-royal bg-transparent rounded-md" 
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email Address
            </label>
            <input 
              type="email" 
              defaultValue={user?.email ? user.email.replace('styailist.com', 'gmail.com') : ''}
              className="input-royal bg-transparent rounded-md" 
              pattern="^[a-zA-Z0-9._%+\-]+@gmail\.com$"
              title="Please enter a valid @gmail.com address"
              required
            />
            <p className="text-xs text-[var(--muted-foreground)]">Only @gmail.com addresses are allowed</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Phone Number
            </label>
            <div className="flex gap-2">
              <select 
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="input-royal bg-transparent rounded-md w-28 appearance-none bg-[url('data:image/svg+xml;utf8,<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20fill=%22none%22%20stroke=%22%23cba052%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%20stroke-width=%222%22%20viewBox=%220%200%2024%2024%22><path%20d=%22M6%209l6%206%206-6%22/></svg>')] bg-no-repeat bg-[position:right_0.5rem_center] pr-6 pl-3"
              >
                <option value="+91">+91 (IN)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
              </select>
              <input 
                type="tel" 
                defaultValue={user?.phone || ''}
                className="input-royal bg-transparent rounded-md flex-1" 
                placeholder={currentPhoneRules.placeholder}
                pattern={currentPhoneRules.pattern}
                maxLength={currentPhoneRules.maxLength}
                title={`Please enter a valid ${currentPhoneRules.placeholder.toLowerCase()}`}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Gender
            </label>
            <select className="input-royal bg-transparent rounded-md appearance-none">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Birthday
            </label>
            <input 
              type="date" 
              className="input-royal bg-transparent rounded-md" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Address
          </label>
          <input 
            type="text" 
            className="input-royal bg-transparent rounded-md" 
            placeholder="Enter your address"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
              Country
            </label>
            <input 
              type="text" 
              className="input-royal bg-transparent rounded-md" 
              placeholder="Enter country"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Zipcode
            </label>
            <input 
              type="text" 
              className="input-royal bg-transparent rounded-md" 
              placeholder="Enter zipcode"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="button" className="px-8 py-3 bg-[var(--maroon)] text-parchment text-sm uppercase tracking-widest hover:bg-[var(--maroon-deep)] transition-all rounded-md shadow-md">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
