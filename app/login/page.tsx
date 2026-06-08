"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Ornament } from '@/components/site/Ornament';
import { authApi } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSecureContext, setIsSecureContext] = useState(true);
  
  const initialized = useRef(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const isAuthenticating = useRef(false);

  useEffect(() => {
    // Check secure context
    const hostname = window.location.hostname;
    const isSecure =
      window.isSecureContext ||
      window.location.protocol === 'https:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1';
    setIsSecureContext(isSecure);
    
    // If script is already loaded (e.g. client side navigation), init immediately
    if (window.google && window.google.accounts && !initialized.current) {
      initGoogleLogin();
    }
    
    // Cleanup on unmount to cancel any outstanding FedCM / GSI prompts
    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;
    setIsLoading(true);
    setError('');
    
    try {
      if (response.credential) {
        const res = await authApi.googleLogin(response.credential);
        if (res.success) {
          window.dispatchEvent(new Event('auth-change'));
          router.push('/profile/personal-details');
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
      isAuthenticating.current = false;
    }
  };

  const initGoogleLogin = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
    if (initialized.current) return;
    
    initialized.current = true;
    
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "64609693042-2lg4esbh0og01p86lemhs56l6lnk6jk4.apps.googleusercontent.com";

    // Single Initialization Pattern
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render custom button
    if (buttonContainerRef.current) {
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        width: 250
      });
    }

    // Trigger one-tap prompt if no errors
    if (!error) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen paper-grain flex items-center justify-center py-20 px-4 relative overflow-hidden">
      
      {/* Load GSI Script */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={initGoogleLogin}
        onReady={initGoogleLogin}
      />

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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          {/* Login Actions */}
          <div className="space-y-6">
            
            {isSecureContext ? (
              <div className="flex justify-center w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-visible py-1 relative z-20 min-h-[44px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-2 w-full">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    <span className="ml-3 text-sm text-gray-700 font-medium">Authenticating...</span>
                  </div>
                ) : (
                  <div className="w-full flex justify-center py-1" ref={buttonContainerRef}>
                    {/* Google button will render here */}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-md p-4 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  ⚠ Secure connection required
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Google Sign-In requires HTTPS or localhost. You&apos;re currently accessing this page over an insecure connection 
                  (<code className="bg-amber-100 px-1 rounded text-[11px]">{typeof window !== 'undefined' ? window.location.origin : ''}</code>).
                </p>
                <p className="text-xs text-amber-700 mt-2 leading-relaxed">
                  To fix: access via <code className="bg-amber-100 px-1 rounded text-[11px]">http://localhost:3000</code> or deploy with HTTPS.
                </p>
              </div>
            )}

          </div>

          <div className="mt-10 pt-6 border-t border-[color-mix(in_oklab,var(--gold)_20%,transparent)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              By signing in, you agree to the palace&apos;s <Link href="#" className="text-[var(--gold)] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[var(--gold)] hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
