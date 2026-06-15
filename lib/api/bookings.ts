import { fetchClient } from './apiClient';

export interface Guest {
  first_name: string;
  last_name: string;
  phone?: string | number;
  email?: string;
  id?: number;
  is_primary?: boolean;
}

export interface CreateBookingPayload {
  room_id: number;
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  number_of_adults: number;
  number_of_children: number;
  guests: Guest[];
  coupon_code?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  room_id: number;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  number_of_adults: number;
  number_of_children: number;
  number_of_nights: number;
  guests: Guest[];
  coupon_code: string | null;
  base_price: number;
  service_charges: number;
  discount_amount: number;
  total_price: number;
  amount_paid?: number;
  balance_due?: number;
  deposit_percent?: number;
  payment_status: string;
  status: string;
  cancellation_policy: string | null;
  created_at: string;
  updated_at: string;
}

export const bookingsApi = {
  async createBooking(payload: CreateBookingPayload): Promise<{ success: boolean; message: string; booking: Booking }> {
    return fetchClient<{ success: boolean; message: string; booking: Booking }>('/api/bookings', {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(payload),
    });
  },

  async getMyBookings(): Promise<{ success: boolean; bookings: Booking[] }> {
    return fetchClient<{ success: boolean; bookings: Booking[] }>('/api/bookings', {
      method: 'GET',
      requireAuth: true,
    });
  },

  async getBookingById(id: number | string): Promise<{ success: boolean; booking: Booking }> {
    return fetchClient<{ success: boolean; booking: Booking }>(`/api/bookings/${id}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  async cancelBooking(id: number | string): Promise<{ success: boolean; message: string; booking: Booking }> {
    return fetchClient<{ success: boolean; message: string; booking: Booking }>(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
      requireAuth: true,
    });
  }
};
