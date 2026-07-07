"use client";

import React, { useEffect, useState } from 'react';
import { authApi, User } from '@/lib/api/auth';

export default function PersonalDetailsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

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

  const handleSavePersonal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const phoneInput = formData.get('phone') as string;
    const phone = phoneInput ? `${countryCode} ${phoneInput}`.trim() : '';

    const rawPayload: Record<string, string> = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      phone,
      gender: formData.get('gender') as string,
      birthday: formData.get('birthday') as string,
      address: formData.get('address') as string,
      country: formData.get('country') as string,
      zipcode: formData.get('zipcode') as string,
    };

    const payload = Object.fromEntries(
      Object.entries(rawPayload).filter(([_, v]) => v !== '')
    );

    try {
      const res = await authApi.updateProfile(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setIsEditingPersonal(false);
      } else {
        alert(res.message || 'Failed to save profile.');
      }
    } catch (err: any) {
      alert(`Failed to save: ${err?.message || 'An error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-up">
      
      {/* Personal Information */}
      <div className="bg-[var(--card)] border border-[var(--gold)]/20 p-8 shadow-sm relative">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4ebd0] flex items-center justify-center text-[var(--gold)] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-xl font-serif text-[var(--foreground)]">Personal Information</h2>
          </div>
          <button 
            onClick={() => setIsEditingPersonal(true)}
            className="px-4 py-2 border border-[var(--gold)]/30 text-[10px] text-[var(--gold)] uppercase tracking-widest hover:bg-[var(--gold)]/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Full Name</p>
            <p className="text-sm text-[var(--foreground)]">{user?.first_name} {user?.last_name}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Date of Birth</p>
            <p className="text-sm text-[var(--foreground)]">
              {user?.birthday ? new Date(user.birthday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Email Address</p>
            <p className="text-sm text-[var(--foreground)]">{user?.email}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Nationality</p>
            <p className="text-sm text-[var(--foreground)]">{user?.country || 'Indian'}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Phone Number</p>
            <p className="text-sm text-[var(--foreground)]">{user?.phone || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Preferred Language</p>
            <p className="text-sm text-[var(--foreground)]">English</p>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="bg-[var(--card)] border border-[var(--gold)]/20 p-8 shadow-sm relative">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f4ebd0] flex items-center justify-center text-[var(--gold)] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h2 className="text-xl font-serif text-[var(--foreground)]">Billing Address</h2>
          </div>
          <button 
            onClick={() => setIsEditingPersonal(true)}
            className="px-4 py-2 border border-[var(--gold)]/30 text-[10px] text-[var(--gold)] uppercase tracking-widest hover:bg-[var(--gold)]/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Address Line 1</p>
            <p className="text-sm text-[var(--foreground)]">{user?.address || '221B, Ballygunge Circular Road'}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Address Line 2</p>
            <p className="text-sm text-[var(--foreground)]">Kolkata - 700019</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">City</p>
            <p className="text-sm text-[var(--foreground)]">Kolkata</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">State</p>
            <p className="text-sm text-[var(--foreground)]">West Bengal</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Country</p>
            <p className="text-sm text-[var(--foreground)]">{user?.country || 'India'}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] mb-1">Pincode</p>
            <p className="text-sm text-[var(--foreground)]">{user?.zipcode || '700019'}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal (Simple fallback for editing) */}
      {isEditingPersonal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--gold)]/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-[var(--foreground)]">Edit Personal Details</h3>
              <button onClick={() => setIsEditingPersonal(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={handleSavePersonal}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">First Name</label>
                  <input type="text" name="first_name" defaultValue={user?.first_name || ''} className="input-royal bg-transparent rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Last Name</label>
                  <input type="text" name="last_name" defaultValue={user?.last_name || ''} className="input-royal bg-transparent rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Phone Number</label>
                  <div className="flex gap-2">
                    <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="input-royal w-24 bg-transparent rounded-md px-2">
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input type="tel" name="phone" defaultValue={user?.phone ? user.phone.replace(/^\+\d+\s/, '') : ''} className="input-royal flex-1 bg-transparent rounded-md" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Gender</label>
                  <select name="gender" defaultValue={user?.gender || ''} className="input-royal bg-transparent rounded-md">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Address</label>
                <input type="text" name="address" defaultValue={user?.address || ''} className="input-royal bg-transparent rounded-md" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Country</label>
                  <input type="text" name="country" defaultValue={user?.country || ''} className="input-royal bg-transparent rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">Zipcode</label>
                  <input type="text" name="zipcode" defaultValue={user?.zipcode || ''} className="input-royal bg-transparent rounded-md" />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--gold)]/10">
                <button type="button" onClick={() => setIsEditingPersonal(false)} className="px-6 py-2 border border-[var(--gold)]/30 text-[var(--muted-foreground)] hover:text-[var(--foreground)] uppercase text-xs tracking-widest">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-widest hover:bg-[var(--maroon-deep)] disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
