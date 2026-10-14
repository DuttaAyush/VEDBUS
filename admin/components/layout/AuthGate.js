"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/api';

const AuthContext = createContext(null);
export const useAdmin = () => useContext(AuthContext);

function VerifiedSession({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    async function verify() {
      const response = await adminFetch('/api/auth/me');
      const payload = await response.json().catch(() => null);
      if (!active) return;
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.replace('/login');
        return;
      }
      if (!response.ok || !payload?.success) { setError(payload?.message || 'Unable to verify your session.'); return; }
      const account = payload.data;
      if (!['ADMIN', 'SUPER_ADMIN'].includes(account?.role)) { setError('This account does not have administrator access.'); return; }
      setUser(account);
    }
    verify();
    return () => { active = false; };
  }, [router, attempt]);
  if (!user) return <div style={{ padding:'3rem', textAlign:'center' }} role="status">{error || 'Verifying admin authorization…'}{error && <div><button onClick={() => { setError(''); setAttempt(v => v + 1); }}>Retry</button> · <button onClick={async () => { await adminFetch('/api/auth/logout', { method:'POST' }); localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); router.replace('/login'); }}>Sign out</button></div>}</div>;
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export default function AuthGate({ children }) {
  const pathname = usePathname();
  if (pathname === '/login') return children;
  return <VerifiedSession key={pathname}>{children}</VerifiedSession>;
}
