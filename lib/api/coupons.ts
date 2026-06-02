import { fetchClient } from './apiClient';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  min_amount: number;
  valid_until: string;
}

export const couponsApi = {
  async getCoupons(): Promise<{ success: boolean; count: number; coupons: Coupon[] }> {
    return fetchClient<{ success: boolean; count: number; coupons: Coupon[] }>('/api/coupons', {
      method: 'GET'
    });
  }
};
