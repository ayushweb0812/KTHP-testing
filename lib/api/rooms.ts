import { fetchClient } from './apiClient';

export interface Room {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
  discount: number;
  bed_type: string;
  features: string[];
  images: string[];
  rating: number;
  reviews: number;
  available?: boolean;
  pricing?: {
    base_price: number;
    coupon_code: string | null;
    coupon_discount: number;
    discount_percent: number;
    discounted_rate: number;
    nights: number;
    price_per_night: number;
    service_charges: number;
    total_price: number;
  };
  created_at: string;
  updated_at: string;
}

export interface SearchRoomsParams {
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  adults?: number;
  children?: number;
  guests?: number;
  room_id?: number;
  coupon_code?: string;
}

export const roomsApi = {
  async getRooms(): Promise<{ success: boolean; rooms: Room[] }> {
    return fetchClient<{ success: boolean; rooms: Room[] }>('/api/rooms/');
  },

  async searchRooms(params: SearchRoomsParams): Promise<{ success: boolean; rooms: Room[] }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, String(value));
      }
    });
    
    return fetchClient<{ success: boolean; rooms: Room[] }>(`/api/rooms/search?${query.toString()}`);
  },

  async getRoomById(id: number): Promise<{ success: boolean; room: Room }> {
    return fetchClient<{ success: boolean; room: Room }>(`/api/rooms/${id}`);
  }
};
