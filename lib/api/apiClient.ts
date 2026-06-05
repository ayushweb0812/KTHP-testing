// d:/kothi-palace-nextjs/lib/api/apiClient.ts

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.kothipalace.com';

/**
 * Gets the access token from localStorage (client-side only).
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

/**
 * Sets the access token in localStorage (client-side only).
 */
export const setAccessToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

/**
 * Removes the access token from localStorage (client-side only).
 */
export const removeAccessToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
  }
};

interface FetchClientOptions extends RequestInit {
  requireAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export const fetchClient = async <T>(
  endpoint: string,
  options: FetchClientOptions = {}
): Promise<T> => {
  const { requireAuth = false, headers, ...customOptions } = options;
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };

  const getHeadersWithToken = (): HeadersInit => {
    const hdrs: Record<string, string> = { ...defaultHeaders } as Record<string, string>;
    if (headers) {
      // @ts-ignore
      Object.assign(hdrs, headers);
    }
    if (requireAuth) {
      const token = getAccessToken();
      if (token) {
        hdrs['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn(`Warning: Auth required for ${endpoint} but no token found`);
      }
    }
    return hdrs;
  };

  let mergedOptions: RequestInit = {
    ...customOptions,
    headers: getHeadersWithToken(),
  };

  let response = await fetch(url, mergedOptions);
  
  if (!response.ok && response.status === 401 && endpoint !== '/api/auth/referesh') {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshRes = await fetch(`${BASE_URL}/api/auth/referesh`, {
            method: 'POST',
            headers: defaultHeaders,
          });
          
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.success && data.access_token) {
              setAccessToken(data.access_token);
              return data.access_token;
            }
          }
          return null;
        } catch (error) {
          return null;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (newToken) {
      // Token refreshed successfully, retry the original request
      mergedOptions.headers = getHeadersWithToken();
      response = await fetch(url, mergedOptions);
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      removeAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session_expired=true';
      }
    }

    throw {
      status: response.status,
      message: data?.error || data?.message || response.statusText,
      data,
    };
  }

  return data as T;
};
