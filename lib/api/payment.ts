import { fetchClient } from './apiClient';

export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  payment: {
    order_id: string;
    amount: number;
    amount_paise: number;
    currency: string;
    key_id: string;
    customer: {
      name: string;
      email: string;
      contact: string;
    };
    booking_details: any;
  };
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const paymentApi = {
  async initiatePayment(bookingId: number | string): Promise<PaymentInitiateResponse> {
    return fetchClient<PaymentInitiateResponse>(`/api/payment/bookings/${bookingId}/initiate`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({}),
    });
  },

  async verifyPayment(bookingId: number | string, payload: VerifyPaymentPayload): Promise<{ success: boolean; message: string; booking: any }> {
    return fetchClient<{ success: boolean; message: string; booking: any }>(`/api/payment/bookings/${bookingId}/verify`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(payload),
    });
  }
};
