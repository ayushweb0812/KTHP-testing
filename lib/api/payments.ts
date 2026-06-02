import { fetchClient } from './apiClient';

export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  payment: {
    order_id: string;
    booking_id: number;
    amount: number;
    amount_paise: number;
    currency: string;
    key_id: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    booking_details: {
      room_id: number;
      check_in_date: string;
      check_out_date: string;
      number_of_nights: number;
    };
  };
}

export interface PaymentVerifyPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  async initiatePayment(bookingId: number | string): Promise<PaymentInitiateResponse> {
    return fetchClient<PaymentInitiateResponse>(`/api/payment/bookings/${bookingId}/initiate`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({}),
    });
  },

  async verifyPayment(bookingId: number | string, payload: PaymentVerifyPayload): Promise<{ success: boolean; message: string; booking: any }> {
    return fetchClient<{ success: boolean; message: string; booking: any }>(`/api/payment/bookings/${bookingId}/verify`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(payload),
    });
  },

  async checkPaymentStatus(bookingId: number | string): Promise<{
    success: boolean;
    payment_status: string;
    booking_status: string;
    amount: number;
    payment_id: string;
    payment_order_id: string;
  }> {
    return fetchClient<any>(`/api/payment/bookings/${bookingId}/status`, {
      method: 'GET',
      requireAuth: true,
    });
  }
};
