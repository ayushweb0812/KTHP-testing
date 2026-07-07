"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Ornament } from '@/components/site/Ornament';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSecureContext, setIsSecureContext] = useState(true);
  
  const initialized = useRef(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const isAuthenticating = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
      // Re-initialize if opened again
      if (window.google && window.google.accounts && !initialized.current) {
        initGoogleLogin();
      }
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setShow(false);
        setError('');
        initialized.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isSecure =
      window.isSecureContext ||
      window.location.protocol === 'https:' ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1';
    setIsSecureContext(isSecure);
    
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
          onClose();
          
          let returnUrl = null;
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            returnUrl = params.get('redirect') || sessionStorage.getItem('auth_return_url');
          }
          if (returnUrl && returnUrl.startsWith('/')) {
            sessionStorage.removeItem('auth_return_url');
            router.push(returnUrl);
          } else {
            router.push('/profile/personal-details');
          }
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

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false, // Handle clicks via modal
    });

    if (buttonContainerRef.current) {
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "signin_with",
        width: 280
      });
    }
  };

  if (!mounted || (!isOpen && !show)) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={initGoogleLogin}
        onReady={initGoogleLogin}
      />
      
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      <div className={`relative bg-[var(--card)] p-10 md:p-14 rounded-xl shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] max-w-lg w-full max-h-full overflow-y-auto transition-all duration-300 transform flex flex-col items-center ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted-foreground)] hover:text-[var(--gold)] transition-colors p-2"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Top Ornament */}
        <div className="flex justify-center mb-8 opacity-80">
          <Ornament className="w-12 h-12 text-[var(--gold)]" />
        </div>

        <p className="eyebrow mb-3">Welcome to Kila</p>
        <h1 className="text-display text-4xl md:text-5xl mb-6 text-center">
          <span className="gold-text">Royal</span> Access
        </h1>
        
        <p className="text-[var(--muted-foreground)] mb-10 text-sm md:text-base leading-relaxed text-center">
          Enter the grand gates of the heritage palace. Sign in to manage your royal stays, view your invoices, and update your profile.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm w-full">
            {error}
          </div>
        )}

        <div className="space-y-6 w-full">
          {isSecureContext ? (
            <div className="flex justify-center w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-visible py-1 relative z-20 min-h-[44px]">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10 w-full rounded-md">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-gray-700 font-medium">Authenticating...</span>
                </div>
              )}
              <div className="w-full flex justify-center py-1" ref={buttonContainerRef} />
            </div>
          ) : (
             <div className="w-full bg-amber-50 border border-amber-200 rounded-md p-4 text-left">
              <p className="text-sm font-semibold text-amber-800 mb-1">
                ⚠ Secure connection required
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Google Sign-In requires HTTPS or localhost. You're currently accessing this page over an insecure connection.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-[color-mix(in_oklab,var(--gold)_20%,transparent)] w-full text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            By signing in, you agree to the palace's <Link href="/terms" className="text-[var(--gold)] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[var(--gold)] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
        
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
