import { fetchClient } from './apiClient';

// ─── Payment Initiate ─────────────────────────────────────────

export interface PaymentInitiateResponse {
  success: boolean;
  message: string;
  payment: {
    order_id: string;
    amount: number;
    amount_paise: number;
    currency: string;
    /** Razorpay publishable key — field name used by this project's backend */
    razorpay_key: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    booking_details: {
      check_in_date: string;
      check_out_date: string;
      number_of_nights: number;
      rooms?: { room_id: number; name?: string }[];
    };
  };
}

// ─── Payment Verify ───────────────────────────────────────────

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ─── Payment Status ───────────────────────────────────────────

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
    deposit_percent?: number;
    partial_payment_enabled: boolean;
  };
  payments: {
    id: number;
    amount: number;
    payment_mode: string;
    status: string;
    created_at: string;
  }[];
}

// ─── API Client ───────────────────────────────────────────────

export const paymentApi = {
  async checkPaymentStatus(bookingId: number | string): Promise<PaymentStatusResponse> {
    return fetchClient<PaymentStatusResponse>(`/api/payment/bookings/${bookingId}/status`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  /**
   * Initiate a Razorpay payment order.
   * @param payload.payment_mode - "full" | "deposit" | "balance"
   */
  async initiatePayment(
    bookingId: number | string,
    payload?: { payment_mode: string }
  ): Promise<PaymentInitiateResponse> {
    return fetchClient<PaymentInitiateResponse>(`/api/payment/bookings/${bookingId}/initiate`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify(payload || {}),
    });
  },

  async verifyPayment(
    bookingId: number | string,
    payload: VerifyPaymentPayload
  ): Promise<{ success: boolean; message: string; booking: Record<string, unknown> }> {
    return fetchClient<{ success: boolean; message: string; booking: Record<string, unknown> }>(
      `/api/payment/bookings/${bookingId}/verify`,
      {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(payload),
      }
    );
  },
};
