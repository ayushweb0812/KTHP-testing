import { fetchClient } from './apiClient';

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  enquiry_type: string;
  date?: string;
  message: string;
}

export interface EnquiryResponse {
  success: boolean;
  message: string;
}

export const enquiryApi = {
  /**
   * Submit an enquiry to the backend
   */
  async submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
    return fetchClient<EnquiryResponse>('/api/enquiry/', {
      method: 'POST',
      requireAuth: false, // Enquiries typically don't require authentication
      body: JSON.stringify(payload),
    });
  }
};
