export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout', '/api/auth/admin-otp', '/api/auth/request-otp'];
let refreshPromise;

function readAccessToken() {
  return typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') : null;
}

function setAccessToken(token) {
  if (typeof window !== 'undefined' && token) {
    window.localStorage.setItem('admin_token', token);
  }
}

async function refreshSession() {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => null);
  const token = payload?.data?.accessToken || payload?.accessToken;
  if (token) setAccessToken(token);
  return token || null;
}

export async function adminFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));

  const request = (token) => fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  try {
    let response = await request(readAccessToken());
    if (response.status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      if (!refreshPromise) refreshPromise = refreshSession().catch(() => null).finally(() => { refreshPromise = null; });
      const refreshedToken = await refreshPromise;
      if (refreshedToken) response = await request(refreshedToken);
      else window.localStorage.removeItem('admin_token');
    }
    return response;
  } catch (err) {
    return {
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ success: false, message: 'Backend service temporarily unavailable', data: [] }),
      text: async () => JSON.stringify({ success: false, message: 'Backend service temporarily unavailable' }),
    };
  }
}

export async function apiData(endpoint, options) {
  const response = await adminFetch(endpoint, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload || payload.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  return payload.data ?? payload;
}

export async function allRecords(endpoint, key) {
  const records = [];
  for (let page = 1; ; page++) {
    const data = await apiData(`${endpoint}${endpoint.includes('?') ? '&' : '?'}limit=50&page=${page}`);
    const list = Array.isArray(data) ? data : data[key];
    if (!Array.isArray(list)) throw new Error('The server returned an invalid record list.');
    records.push(...list);
    if (!data.pagination || page >= data.pagination.totalPages) return records;
  }
}
