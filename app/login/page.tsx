"use client";

import React, { useRef } from 'react';
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useRouter } from 'next/navigation';
import { useTransition } from '@/components/transitions/TransitionContext';
import { Ornament } from '@/components/site/Ornament';
import { authApi } from '@/lib/api/auth';
import { GoogleAuthWrapper } from '@/components/auth/GoogleAuthWrapper';

export default function LoginPage() {
  const router = useRouter();
  const { startTransition } = useTransition();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const isAuthenticating = useRef(false);

  const handleAuthSuccess = async (credential: string) => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;
    
    try {
      console.log("[Google Auth] Sending credential to backend for validation...");
      const res = await authApi.googleLogin(credential);
      
      if (res.success) {
        console.log("[Google Auth] Backend authentication successful.");
        window.dispatchEvent(new Event('auth-change'));
        
        let redirectUrl = null;
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          redirectUrl = params.get('redirect');
          if (!redirectUrl) {
            redirectUrl = sessionStorage.getItem('auth_return_url');
          }
        }
        
        if (redirectUrl && redirectUrl.startsWith('/')) {
          sessionStorage.removeItem('auth_return_url');
          startTransition();
          router.push(redirectUrl);
        } else {
          startTransition();
          router.push('/profile/personal-details');
        }
      } else {
        throw new Error('Backend authentication failed');
      }
    } finally {
      isAuthenticating.current = false;
    }
  };

  return (
    <div className="min-h-screen paper-grain flex items-center justify-center py-20 px-4 relative overflow-hidden">
      
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        
        {/* Royal Card */}
        <div 
          className="bg-[var(--card)] p-10 md:p-14 rounded-xl relative shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] text-center"
          style={{ transform: 'none' }}
        >
          {/* Top Ornament */}
          <div className="flex justify-center mb-8 opacity-80">
            <Ornament className="w-12 h-12 text-[var(--gold)]" />
          </div>

          <p className="eyebrow mb-3">Welcome to Kila</p>
          <h1 className="text-display text-4xl md:text-5xl mb-6">
            <span className="gold-text">Royal</span> Access
          </h1>
          
          <p className="text-[var(--muted-foreground)] mb-10 text-sm md:text-base leading-relaxed">
            Enter the grand gates of the heritage palace. Sign in to manage your royal stays, view your invoices, and update your profile.
          </p>

          {/* Login Actions */}
          <div className="space-y-6">
            <GoogleAuthWrapper onSuccess={handleAuthSuccess} buttonWidth={280} />
          </div>

          <div className="mt-10 pt-6 border-t border-[color-mix(in_oklab,var(--gold)_20%,transparent)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              By signing in, you agree to the palace&apos;s <Link href="/terms" className="text-[var(--gold)] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
