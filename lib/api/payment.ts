import { fetchClient } from './apiClient';

export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  payment: {
    order_id: string;
    amount: number;
    amount_paise: number;
    currency: string;
    razorpay_key: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    booking_details: any;
  };
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment_status: string;
  booking_status: string;
  total_price: number;
  amount_paid: number;
  balance_due: number;
  deposit_percent: number;
  deposit_amount: number;
  partial_payment_enabled: boolean;
  payment_options?: {
    allow_deposit: boolean;
    allow_full: boolean;
    allow_balance: boolean;
    required_mode: string;
    deposit_amount: number;
    partial_payment_enabled: boolean;
  };
  payments: any[];
}

export const paymentApi = {
  async checkPaymentStatus(bookingId: number | string): Promise<PaymentStatusResponse> {
    return fetchClient<PaymentStatusResponse>(`/api/payment/bookings/${bookingId}/status`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  async initiatePayment(bookingId: number | string, payload?: { payment_mode: string }): Promise<PaymentInitiateResponse> {
    return fetchClient<PaymentInitiateResponse>(`/api/payment/bookings/${bookingId}/initiate`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(payload || {}),
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
