// paymentService.ts

import { apiFetch } from './apiService';

interface CreateInvoiceParams {
  amount: number;
  phoneNumber: string;
  merchantTransId: string;
}

interface InvoiceResponse {
  error_code: number;
  error_note: string;
  invoice_id?: number;
  eps_id?: string;
}

interface PaymentStatusResponse {
  id: string;
  status: string;
  amount: number;
  service_type: string;
  created_at: string;
  completed_at?: string;
  click_trans_id?: string;
  click_paydoc_id?: string;
  error_code?: number;
  error_note?: string;
}

interface CardTokenRequest {
  cardNumber: string;
  expireDate: string;
  temporary?: number;
}

interface CardTokenResponse {
  error_code: number;
  error_note: string;
  card_token?: string;
  phone_number?: string;
  temporary?: number;
}

class PaymentService {
  private baseUrl = '/payments/transactions';

  async createTransaction(amount: number, serviceType: string, description?: string): Promise<any> {
    try {
      const transactionData = {
        amount: amount,
        service_type: serviceType,
        description: description || `To'lov: ${serviceType}`
      };
      
      const response = await apiFetch(`${this.baseUrl}/`, {
        method: 'POST',
        body: JSON.stringify(transactionData),
      });
      return response;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async preparePayment(transactionId: string): Promise<any> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${transactionId}/prepare_payment/`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error preparing payment:', error);
      throw error;
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${transactionId}/check_status/`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  async getPaymentUrl(transactionId: string, returnUrl?: string): Promise<any> {
    try {
      let url = `${this.baseUrl}/${transactionId}/get_payment_url/`;
      if (returnUrl) {
        url += `?return_url=${encodeURIComponent(returnUrl)}`;
      }

      const response = await apiFetch(url, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error getting payment URL:', error);
      throw error;
    }
  }

  async requestCardToken(cardNumber: string, expireDate: string, serviceType: string = 'publication_fee'): Promise<CardTokenResponse> {
    try {
      const response = await apiFetch('/payments/card-token/request/', {
        method: 'POST',
        body: JSON.stringify({
          card_number: cardNumber,
          expire_date: expireDate,
          service_type: serviceType
        }),
      });
      return response;
    } catch (error) {
      console.error('Error requesting card token:', error);
      throw error;
    }
  }

  async verifyCardToken(cardToken: string, smsCode: string, serviceType: string = 'publication_fee'): Promise<any> {
    try {
      const response = await apiFetch('/payments/card-token/verify/', {
        method: 'POST',
        body: JSON.stringify({
          card_token: cardToken,
          sms_code: smsCode,
          service_type: serviceType
        }),
      });
      return response;
    } catch (error) {
      console.error('Error verifying card token:', error);
      throw error;
    }
  }

  async payWithCardToken(cardToken: string, amount: number, transactionId: string, serviceType: string = 'publication_fee'): Promise<any> {
    try {
      const response = await apiFetch('/payments/card-token/pay/', {
        method: 'POST',
        body: JSON.stringify({
          card_token: cardToken,
          amount: amount,
          transaction_id: transactionId,
          service_type: serviceType
        }),
      });
      return response;
    } catch (error) {
      console.error('Error paying with card token:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();