"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Ornament } from '@/components/site/Ornament';
import { authApi } from '@/lib/api/auth';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError('');
    
    try {
      if (credentialResponse.credential) {
        const res = await authApi.googleLogin(credentialResponse.credential);
        if (res.success) {
          router.push('/reserve'); // Redirect to reserve or account page
        } else {
          throw new Error('Backend authentication failed');
        }
      } else {
        throw new Error('No credential received from Google');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Login failed or was cancelled.');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <div className="min-h-screen paper-grain flex items-center justify-center py-20 px-4 relative overflow-hidden">
        
        {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        
        {/* Royal Card */}
        <div 
          className="bg-[var(--card)] p-10 md:p-14 rounded-xl relative shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] animate-fade-up text-center"
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          {/* Login Actions */}
          <div className="space-y-6">
            
            <div className="flex justify-center w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden py-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-gray-700 font-medium">Authenticating...</span>
                </div>
              ) : (
                <div className="w-full flex justify-center py-1">
                  <GoogleLogin 
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    shape="rectangular"
                    text="signin_with"
                    theme="outline"
                  />
                </div>
              )}
            </div>

            <div className="ornate-divider">
              <span className="text-xs uppercase tracking-widest">or</span>
            </div>

            {/* Simulated Email Login (visual only, per API docs) */}
            <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm text-[var(--foreground)] mb-1 font-medium">Email Address</label>
                <input 
                  type="email" 
                  placeholder="royal.guest@example.com"
                  className="input-royal bg-transparent"
                />
              </div>
              <button 
                type="button"
                className="w-full bg-[var(--maroon)] text-[var(--primary-foreground)] py-3 px-4 rounded-md font-medium tracking-wide shine-on-hover hover:bg-[var(--maroon-deep)] transition-colors"
                onClick={() => alert('Only Google Login is supported by the API currently.')}
              >
                Continue with Email
              </button>
            </form>

          </div>

          <div className="mt-10 pt-6 border-t border-[color-mix(in_oklab,var(--gold)_20%,transparent)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              By signing in, you agree to the palace&apos;s <Link href="#" className="text-[var(--gold)] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[var(--gold)] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
    </GoogleOAuthProvider>
  );
}
