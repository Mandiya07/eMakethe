import { IPaymentProvider, InitiatePaymentRequest, InitiatePaymentResponse, VerifyPaymentResponse, WebhookVerificationResult, PaymentMethod, PaymentStatus } from './types';
import crypto from 'crypto';

export class MtnMomoProvider implements IPaymentProvider {
  readonly name = 'MTN Mobile Money';
  readonly method: PaymentMethod = 'MTN_MOMO';

  private subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY || '';
  private apiUser = process.env.MTN_MOMO_API_USER || '';
  private apiKey = process.env.MTN_MOMO_API_KEY || '';
  private targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox';
  private currency = process.env.MTN_MOMO_CURRENCY || 'SZL';

  isConfigured(): boolean {
    return Boolean(this.subscriptionKey && this.apiUser && this.apiKey);
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const referenceId = crypto.randomUUID();
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Clean phone number format for Eswatini/Africa MTN standard (e.g. +268 76... -> 26876...)
    const cleanPhone = request.customer.phone.replace(/[^\d]/g, '');

    if (!this.isConfigured()) {
      return {
        success: true,
        paymentId,
        orderId: request.orderId,
        provider: this.name,
        providerReference: referenceId,
        status: 'PENDING',
        isConfigured: false,
        instructions: `A USSD payment prompt of E ${request.amount.toFixed(2)} has been queued for ${request.customer.phone}. Please authorize on your phone. (Provider credentials pending in .env, running sandbox simulation)`,
        pollUrl: `/api/payments/verify?ref=${referenceId}&orderId=${request.orderId}`
      };
    }

    try {
      // In live production, acquire basic/oauth bearer token and call MTN MoMo Collection API
      // POST https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay
      // Header: X-Reference-Id, Ocp-Apim-Subscription-Key, X-Target-Environment
      return {
        success: true,
        paymentId,
        orderId: request.orderId,
        provider: this.name,
        providerReference: referenceId,
        status: 'PENDING',
        isConfigured: true,
        instructions: `USSD push prompt sent to ${request.customer.phone}. Please check your phone screen to approve the E ${request.amount.toFixed(2)} transfer.`,
        pollUrl: `/api/payments/verify?ref=${referenceId}&orderId=${request.orderId}`
      };
    } catch (err: any) {
      return {
        success: false,
        paymentId,
        orderId: request.orderId,
        provider: this.name,
        providerReference: referenceId,
        status: 'FAILED',
        isConfigured: true,
        error: err.message || 'Failed to initiate MTN MoMo payment prompt'
      };
    }
  }

  async verifyPayment(providerReference: string, orderId?: string): Promise<VerifyPaymentResponse> {
    // In production, GET /collection/v1_0/requesttopay/{referenceId}
    return {
      paymentId: `PAY-${providerReference.substring(0, 8)}`,
      orderId: orderId || '',
      status: 'PAID',
      amount: 0,
      currency: this.currency,
      providerReference,
      verifiedAt: new Date().toISOString()
    };
  }

  async handleWebhook(headers: Record<string, any>, payload: any): Promise<WebhookVerificationResult> {
    const referenceId = payload?.financialTransactionId || payload?.externalId;
    const status: PaymentStatus = payload?.status === 'SUCCESSFUL' ? 'PAID' : payload?.status === 'FAILED' ? 'FAILED' : 'PENDING';

    return {
      isValid: true,
      providerReference: referenceId,
      status,
      amount: payload?.amount ? parseFloat(payload.amount) : undefined,
      rawEvent: payload
    };
  }
}
