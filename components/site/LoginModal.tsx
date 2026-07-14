"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useRouter } from 'next/navigation';
import { useTransition } from '@/components/transitions/TransitionContext';
import { authApi } from '@/lib/api/auth';
import { Ornament } from '@/components/site/Ornament';
import { GoogleAuthWrapper } from '@/components/auth/GoogleAuthWrapper';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl?: string;
}

export function LoginModal({ isOpen, onClose, returnUrl = '/profile/personal-details' }: LoginModalProps) {
  const router = useRouter();
  const { beginPageTransition } = useTransition();
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  
  const isAuthenticating = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setShow(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAuthSuccess = async (credential: string) => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;
    
    try {
      const res = await authApi.googleLogin(credential);
      if (res.success) {
        window.dispatchEvent(new Event('auth-change'));
        
        let targetUrl = null;
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          targetUrl = params.get('redirect') || sessionStorage.getItem('auth_return_url');
        }
        
        onClose();
        beginPageTransition();
        
        if (targetUrl && targetUrl.startsWith('/')) {
          sessionStorage.removeItem('auth_return_url');
          router.push(targetUrl);
        } else {
          router.push(returnUrl);
        }
      } else {
        throw new Error('Backend authentication failed');
      }
    } finally {
      isAuthenticating.current = false;
    }
  };

  if (!mounted || (!isOpen && !show)) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
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

        <div className="space-y-6 w-full">
          <GoogleAuthWrapper onSuccess={handleAuthSuccess} buttonWidth={280} />
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
