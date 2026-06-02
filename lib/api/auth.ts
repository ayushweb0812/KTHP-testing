import { fetchClient, setAccessToken, removeAccessToken } from './apiClient';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  phone: string;
  gender: string;
  birthday: string;
  address: string;
  country: string;
  zipcode: string;
  profile_picture: string;
  google_id: string;
  last_login: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  user: User;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile?: string;
  gender?: string;
  birthday?: string; // YYYY-MM-DD
  address?: string;
  country?: string;
  zipcode?: string;
}

export const authApi = {
  async googleLogin(idToken: string): Promise<AuthResponse> {
    const data = await fetchClient<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
    if (data.success && data.access_token) {
      setAccessToken(data.access_token);
    }
    return data;
  },

  async refreshToken(): Promise<{ success: boolean; access_token: string }> {
    const data = await fetchClient<{ success: boolean; access_token: string }>('/api/auth/referesh', {
      method: 'POST',
    });
    if (data.success && data.access_token) {
      setAccessToken(data.access_token);
    }
    return data;
  },

  async getProfile(): Promise<{ success: boolean; user: User }> {
    return fetchClient<{ success: boolean; user: User }>('/api/auth/profile', {
      method: 'GET',
      requireAuth: true,
    });
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<{ success: boolean; message: string; user: User }> {
    return fetchClient<{ success: boolean; message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(payload),
    });
  },

  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    const res = await fetchClient<{ success: boolean; message?: string }>('/api/auth/delete-account', {
      method: 'DELETE',
      requireAuth: true,
    });
    removeAccessToken();
    return res;
  },

  logout() {
    removeAccessToken();
  }
};
