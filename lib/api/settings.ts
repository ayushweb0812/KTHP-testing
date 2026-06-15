import { fetchClient } from './apiClient';

export interface PaymentSettingsResponse {
  success: boolean;
  settings: {
    partial_payment_enabled: boolean;
    deposit_percent: number;
  };
}

export const settingsApi = {
  async getPaymentSettings(): Promise<PaymentSettingsResponse> {
    return fetchClient<PaymentSettingsResponse>('/api/settings/payment', {
      method: 'GET',
      requireAuth: false,
    });
  }
};
