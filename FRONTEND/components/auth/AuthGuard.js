'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated, getStoredToken, openAuthModal } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';

export default function AuthGuard({
  children,
  title = 'Login Required',
  subtitle = 'Please log in or sign up to access this page and manage your bookings.',
  redirectTo = '/',
}) {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const hasLocalCredentials = isAuthenticated();
      if (!hasLocalCredentials && !getStoredToken()) {
        setAuthed(false);
        setChecking(false);
        setTimeout(() => openAuthModal('login'), 300);
        return;
      }

      try {
        const response = await apiFetch('/api/auth/me');
        const data = await response.json();
        const user = data?.data?.user || data?.data || data?.user;
        if (response.ok && data?.success !== false && user?.id) {
          localStorage.setItem('auth_user', JSON.stringify(user));
          setAuthed(true);
          return;
        }
      } catch {
        // The guard below keeps protected content hidden when verification fails.
      } finally {
        setChecking(false);
      }

      setAuthed(false);
      setTimeout(() => {
        openAuthModal('login');
      }, 300);
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-brand-scarlet border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checking authentication...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl text-center space-y-5 animate-fadeIn">
            {/* Clean branding badge - NO alert icons */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-brand-scarlet flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-slate-900">{title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{subtitle}</p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full min-h-[46px] rounded-2xl bg-brand-scarlet hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Log In / Sign Up</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <Link
                href={redirectTo}
                className="w-full min-h-[44px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return children;
}
