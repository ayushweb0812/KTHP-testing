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
  fits_required_capacity?: boolean;
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

export interface Combo {
  combo_id?: string;
  id?: string | number;
  room_ids: number[];
  name: string;
  description: string;
  total_capacity: number;
  total_price?: number;
  discounted_price?: number;
  pricing?: {
    total_price: number;
    discounted_price?: number;
    discount_percent?: number;
    base_price?: number;
  };
  images: string[];
}

export interface SearchRoomsParams {
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  adults?: number;
  children_ages?: string;
  rooms?: number;
  guests?: number;
  room_id?: number;
  coupon_code?: string;
}

export interface SearchRoomsResponse {
  success: boolean;
  rooms: Room[];
  combos?: Combo[];
  required_capacity?: number;
}

export const roomsApi = {
  async getRooms(): Promise<{ success: boolean; rooms: Room[] }> {
    return fetchClient<{ success: boolean; rooms: Room[] }>('/api/rooms/', {
      cache: 'no-store',
    });
  },

  async searchRooms(params: SearchRoomsParams): Promise<SearchRoomsResponse> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, String(value));
      }
    });
    
    return fetchClient<SearchRoomsResponse>(`/api/rooms/search?${query.toString()}`, {
      cache: 'no-store',
    });
  },

  async getRoomById(id: number): Promise<{ success: boolean; room: Room }> {
    return fetchClient<{ success: boolean; room: Room }>(`/api/rooms/${id}`, {
      cache: 'no-store',
    });
  }
};
