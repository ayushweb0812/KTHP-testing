/**
 * @deprecated This file is a legacy duplicate of payment.ts.
 * Import from '@/lib/api/payment' instead.
 * This file is kept temporarily to avoid breaking any remaining imports.
 */
export { paymentApi, type PaymentInitiateResponse, type VerifyPaymentPayload, type PaymentStatusResponse } from './payment';

// Legacy alias — remove after confirming no remaining callers
export const paymentsApi = {
  /** @deprecated Use paymentApi.initiatePayment */
  initiatePayment: (bookingId: number | string) => {
    const { paymentApi } = require('./payment');
    return paymentApi.initiatePayment(bookingId);
  },
  /** @deprecated Use paymentApi.verifyPayment */
  verifyPayment: (bookingId: number | string, payload: unknown) => {
    const { paymentApi } = require('./payment');
    return paymentApi.verifyPayment(bookingId, payload);
  },
  /** @deprecated Use paymentApi.checkPaymentStatus */
  checkPaymentStatus: (bookingId: number | string) => {
    const { paymentApi } = require('./payment');
    return paymentApi.checkPaymentStatus(bookingId);
  },
};
