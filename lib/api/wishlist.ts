import { fetchClient } from './apiClient';

export const wishlistApi = {
  async getWishlist(): Promise<any> {
    return fetchClient<any>('/api/wishlist', {
      method: 'GET',
      requireAuth: true,
    });
  },

  async addToWishlist(roomId: number): Promise<any> {
    return fetchClient<any>('/api/wishlist', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({ room_id: roomId }),
    });
  },

  async removeFromWishlist(roomId: number): Promise<any> {
    return fetchClient<any>(`/api/wishlist/${roomId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }
};
