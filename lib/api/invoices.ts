import { fetchClient, BASE_URL, getAccessToken } from './apiClient';

export interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  booking_id: number;
  room_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  total_amount: number;
  payment_status: string;
  created_at?: string;
}

export interface InvoiceDetailResponse {
  success: boolean;
  invoice?: {
    invoice: Invoice;
    booking: any;
    user: any;
    room: any;
    primary_guest: any;
    guests: any[];
  };
  // or it might return the invoice details directly depending on the backend
}

export const invoicesApi = {
  // --- USER ENDPOINTS ---

  async getInvoices(): Promise<{ success: boolean; invoices: Invoice[]; count: number }> {
    return fetchClient<{ success: boolean; invoices: Invoice[]; count: number }>('/api/invoices', {
      method: 'GET',
      requireAuth: true,
    });
  },

  async getInvoiceByBooking(bookingId: number | string): Promise<InvoiceDetailResponse> {
    return fetchClient<InvoiceDetailResponse>(`/api/invoices/booking/${bookingId}`, {
      method: 'GET',
      requireAuth: true,
    });
  },

  async generateInvoice(bookingId: number | string): Promise<{ success: boolean; message: string; invoice_id: number; invoice_number: string }> {
    return fetchClient<{ success: boolean; message: string; invoice_id: number; invoice_number: string }>(`/api/invoices/generate/${bookingId}`, {
      method: 'POST',
      requireAuth: true,
      body: JSON.stringify({}),
    });
  },

  /**
   * Helper function to download an invoice PDF
   */
  async downloadInvoice(invoiceId: number | string, invoiceNumber: string = 'invoice'): Promise<void> {
    const token = getAccessToken();
    const response = await fetch(`${BASE_URL}/api/invoices/${invoiceId}/download`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to download invoice';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // --- ADMIN ENDPOINTS ---

  async adminGetAllInvoices(params?: { payment_status?: string; date_from?: string; date_to?: string; user_id?: number }): Promise<any> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    const queryString = query.toString();
    return fetchClient<any>(`/api/admin/bookings/invoices${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      requireAuth: true,
    });
  }
};
