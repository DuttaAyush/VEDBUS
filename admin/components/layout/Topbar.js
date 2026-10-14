"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/api';

export default function Topbar({ onToggleSidebar, user }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setBusy(true);
    const response = await adminFetch('/api/auth/logout', { method:'POST' });
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    if (!response.ok) { setError('Server sign-out failed. Retry to clear the cookie session.'); setBusy(false); return; }
    router.replace('/login');
  }
  return <header style={{ minHeight:64, padding:'1rem 1.5rem', background:'#fff', borderBottom:'1px solid #e2e8f0', display:'flex', gap:'1rem', alignItems:'center' }}><button onClick={onToggleSidebar} aria-label="Toggle navigation"><span className="material-symbols-outlined">menu</span></button><span style={{ flex:1 }}>YatraBus Operations</span>{error && <span role="alert">{error}</span>}<Link href="/settings">{user?.name} · {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</Link><button disabled={busy} onClick={logout}>{busy ? 'Signing out…' : 'Logout'}</button></header>;
}
