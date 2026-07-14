"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';

interface GoogleAuthWrapperProps {
  onSuccess: (credential: string) => Promise<void>;
  buttonWidth?: number | string;
}

type EnvState = 'checking' | 'ready' | 'webview' | 'insecure' | 'no_config';

export function GoogleAuthWrapper({ onSuccess, buttonWidth = 280 }: GoogleAuthWrapperProps) {
  const [envState, setEnvState] = useState<EnvState>('checking');
  const [oauthError, setOauthError] = useState(false);
  const [retryKey, setRetryKey] = useState(0); 
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    // 1. Config Validation
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("[Google Auth] Developer Error: NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing.");
      setEnvState('no_config');
      return;
    }

    // 2. Secure Context Validation
    const hostname = window.location.hostname;
    const isSecure = window.isSecureContext || window.location.protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isSecure) {
      console.warn("[Google Auth] Warning: Insecure context detected.");
      setEnvState('insecure');
      return;
    }

    // 3. Lightweight WebView Detection
    // Checks for Facebook, Instagram, Line, LinkedIn, WhatsApp in-app browsers which natively block GIS.
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isWebView = /FBAN|FBAV|Instagram|WhatsApp|Line|LinkedInApp/i.test(ua);
    
    if (isWebView) {
      console.warn(`[Google Auth] Blocked by WebView detection. UA: ${ua}`);
      setEnvState('webview');
      return;
    }

    console.log("[Google Auth] Environment check passed. Ready to initialize.");
    setEnvState('ready');
    
    return () => { mounted.current = false; };
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      console.error("[Google Auth] OAuth success callback fired, but no credential received.");
      setOauthError(true);
      return;
    }
    
    console.log("[Google Auth] Google OAuth credential received.");
    setIsAuthenticating(true);
    setOauthError(false);
    
    try {
      await onSuccess(credentialResponse.credential);
    } catch (err) {
      console.error("[Google Auth] Authentication failed:", err);
      if (mounted.current) setOauthError(true);
    } finally {
      if (mounted.current) setIsAuthenticating(false);
    }
  };

  const handleError = () => {
    console.error("[Google Auth] Google Sign-In script failed to load or initialization failed.");
    setOauthError(true);
  };

  const handleRetry = () => {
    console.log("[Google Auth] Retrying Google Auth initialization...");
    setOauthError(false);
    setRetryKey(prev => prev + 1);
  };

  if (envState === 'checking') {
    return (
      <div className="flex items-center justify-center py-3 w-full border border-transparent">
        <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-[var(--muted-foreground)] font-medium">Checking environment...</span>
      </div>
    );
  }

  // Developer error in console, generic error in UI
  if (envState === 'no_config') {
    return (
      <div className="flex flex-col items-center justify-center py-3 w-full text-center">
        <p className="text-sm font-medium text-red-600 mb-1">Sign-in is temporarily unavailable</p>
        <p className="text-xs text-gray-500">Please try again later.</p>
      </div>
    );
  }

  if (envState === 'insecure') {
    return (
      <div className="w-full bg-amber-50 border border-amber-200 rounded-md p-4 text-left">
        <p className="text-sm font-semibold text-amber-800 mb-1">⚠ Secure connection required</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          Google Sign-In requires HTTPS or localhost. You are on an insecure connection.
        </p>
      </div>
    );
  }

  if (envState === 'webview') {
    return (
      <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-4 text-left">
        <p className="text-sm font-semibold text-blue-800 mb-2">Unsupported Browser</p>
        <p className="text-xs text-blue-700 leading-relaxed mb-3">
          Google Sign-In isn't supported inside this in-app browser. 
        </p>
        <p className="text-xs font-medium text-blue-800">
          Please tap the menu icon (⋮ or ⋯) and select "Open in Chrome" or "Open in Safari" to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full relative z-20">
      {oauthError ? (
        <div className="w-full flex flex-col items-center justify-center py-3 bg-red-50 border border-red-200 rounded-md p-4" aria-live="polite">
          <p className="text-sm text-red-700 font-medium mb-1">Authentication Failed</p>
          <p className="text-xs text-red-600 text-center mb-3">
            We couldn't connect to Google. This might be a temporary network issue.
          </p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded text-xs font-medium shadow-sm hover:bg-red-50 transition-colors focus:ring-2 focus:ring-red-200 focus:outline-none"
            aria-label="Retry Google Sign In"
          >
            Retry Connection
          </button>
        </div>
      ) : isAuthenticating ? (
        <div className="flex items-center justify-center py-3 w-full bg-white rounded-md border border-gray-200 shadow-sm" aria-live="polite">
          <div className="w-5 h-5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-700 font-medium">Authenticating...</span>
        </div>
      ) : (
        <div className="w-full flex justify-center" key={retryKey}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            theme="outline"
            size="large"
            shape="rectangular"
            text="signin_with"
            width={buttonWidth}
          />
        </div>
      )}
    </div>
  );
}
