// d:/kothi-palace-nextjs/lib/api/apiClient.ts

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://overhappily-nonfeloniously-roseann.ngrok-free.dev';

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

export const fetchClient = async <T>(
  endpoint: string,
  options: FetchClientOptions = {}
): Promise<T> => {
  const { requireAuth = false, headers, ...customOptions } = options;
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn(`Warning: Auth required for ${endpoint} but no token found`);
    }
  }

  const mergedOptions: RequestInit = {
    ...customOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data?.error || data?.message || response.statusText,
      data,
    };
  }

  return data as T;
};
