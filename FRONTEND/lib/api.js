export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function isApiUrl(url) {
  try {
    return new URL(url).origin === new URL(API_BASE_URL).origin;
  } catch {
    return false;
  }
}

function storeAuthResponse(data) {
  const auth = data?.data || data;
  const token = auth?.accessToken;
  const user = auth?.user;

  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('auth_token', token);
    if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    if (token || user) {
      window.dispatchEvent(new Event('auth-change'));
    }
  }

  return Boolean(token && user);
}

/**
 * apiFetch — authenticated fetch for the customer frontend.
 *
 * Auth strategy (in priority order):
 * 1. httpOnly cookie sent automatically by the browser (credentials: 'include')
 * 2. Fallback: Bearer token from localStorage (for dev/compat)
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const isApiRequest = isApiUrl(url);
  const shouldRefresh = isApiRequest && options._retry !== true && options._skipRefresh !== true;

  // Try reading token from localStorage as fallback (dev mode or if cookie is not set)
  const token =
    (typeof window !== 'undefined' &&
      (localStorage.getItem('auth_token') || localStorage.getItem('token'))) ||
    null;

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(isApiRequest && token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const requestOptions = { ...options };
  delete requestOptions._retry;
  delete requestOptions._skipRefresh;
  delete requestOptions.headers;

  try {
    const response = await fetch(url, {
      ...requestOptions,
      headers,
      credentials: isApiRequest ? 'include' : (options.credentials || 'omit'),
    });

    if (response.status !== 401 || !shouldRefresh) return response;

    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!refreshResponse.ok) return response;

    const refreshData = await refreshResponse.json();
    if (!storeAuthResponse(refreshData)) return response;

    const refreshedToken =
      (typeof window !== 'undefined' && localStorage.getItem('auth_token')) || null;
    return fetch(url, {
      ...requestOptions,
      headers: {
        ...headers,
        ...(refreshedToken ? { Authorization: `Bearer ${refreshedToken}` } : {}),
      },
      credentials: 'include',
    });
  } catch (err) {
    console.warn(`[apiFetch] Network error for ${url}:`, err?.message || err);
    return {
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ success: false, message: 'Backend service temporarily unavailable', data: null }),
      text: async () => JSON.stringify({ success: false, message: 'Backend service temporarily unavailable' }),
    };
  }
}
