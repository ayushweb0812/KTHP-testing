import { fetchClient } from './apiClient';

export interface Review {
  id: number;
  user_id?: number;
  rating: number;
  review_text: string;
  is_displayed?: boolean;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    profile_picture: string;
    country: string;
  };
}

export interface SubmitReviewPayload {
  rating: number;
  review_text: string;
}

export const reviewsApi = {
  async getMyReviews(): Promise<{ success: boolean; count: number; reviews: Review[] }> {
    return fetchClient<{ success: boolean; count: number; reviews: Review[] }>('/api/reviews', {
      method: 'GET',
      requireAuth: true,
    });
  },

  async submitReview(payload: SubmitReviewPayload): Promise<{ success: boolean; message: string; review: Review }> {
    return fetchClient<{ success: boolean; message: string; review: Review }>('/api/reviews', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(payload),
    });
  },

  async updateReview(id: number | string, payload: Partial<SubmitReviewPayload>): Promise<{ success: boolean; message: string; review: Review }> {
    return fetchClient<{ success: boolean; message: string; review: Review }>(`/api/reviews/${id}`, {
      method: 'PUT',
      requireAuth: true,
      body: JSON.stringify(payload),
    });
  },

  async deleteReview(id: number | string): Promise<{ success: boolean; message: string }> {
    return fetchClient<{ success: boolean; message: string }>(`/api/reviews/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  },

  async getPublicReviews(): Promise<{ success: boolean; total: number; limit: number; offset: number; reviews: Review[] }> {
    // Note: The doc mentions /reviews or /api/reviews without auth
    return fetchClient<{ success: boolean; total: number; limit: number; offset: number; reviews: Review[] }>('/reviews', {
      method: 'GET',
    });
  }
};
