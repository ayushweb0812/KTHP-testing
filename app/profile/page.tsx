"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User } from '@/lib/api/auth';
import { Ornament } from '@/components/site/Ornament';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        if (mounted) {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            router.push('/login');
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to fetch profile", err);
          router.push('/login');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen paper-grain flex items-center justify-center py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--gold)] tracking-[0.28em] uppercase text-sm">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen paper-grain py-24 px-4 relative overflow-hidden flex justify-center">
      <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-3xl mt-12">
        <div className="bg-[var(--card)] p-8 md:p-12 rounded-xl relative shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] animate-fade-up">
          
          <div className="flex justify-center mb-6 opacity-80">
            <Ornament className="w-10 h-10 text-[var(--gold)]" />
          </div>

          <p className="eyebrow text-center mb-2">Royal Guest</p>
          <h1 className="text-display text-3xl md:text-4xl mb-8 text-center">
            <span className="gold-text">Your</span> Profile
          </h1>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            
            {/* Left Column: Avatar & Basic Info */}
            <div className="w-full md:w-1/3 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full border border-[var(--gold)] overflow-hidden mb-6 relative">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--background)] flex items-center justify-center text-4xl text-[var(--gold)]">
                    {user.first_name ? user.first_name[0] : 'K'}
                  </div>
                )}
              </div>
              <h2 className="text-2xl text-[var(--foreground)] font-serif mb-1">{user.name || `${user.first_name} ${user.last_name}`}</h2>
              <p className="text-[var(--muted-foreground)] text-sm mb-4">{user.email}</p>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="w-full md:w-2/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">First Name</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.first_name || '—'}</p>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Last Name</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.last_name || '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Phone</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.phone || '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Gender</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2 capitalize">{user.gender || '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Birthday</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.birthday || '—'}</p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Country</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.country || '—'}</p>
                </div>

                <div className="sm:col-span-2">
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Address</h3>
                  <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.address || '—'} {user.zipcode && `- ${user.zipcode}`}</p>
                </div>

              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  onClick={() => {
                    authApi.logout();
                    window.location.href = '/';
                  }}
                  className="px-6 py-2 border border-[var(--gold)] text-[var(--gold)] text-xs uppercase tracking-[0.32em] hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-all duration-500"
                >
                  Logout
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
