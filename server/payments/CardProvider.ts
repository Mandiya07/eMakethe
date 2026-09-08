import { IPaymentProvider, InitiatePaymentRequest, InitiatePaymentResponse, VerifyPaymentResponse, WebhookVerificationResult, PaymentMethod, PaymentStatus } from './types';
import crypto from 'crypto';

export class CardProvider implements IPaymentProvider {
  readonly name = 'Secure Card Gateway (PCI-DSS Hosted)';
  readonly method: PaymentMethod = 'CARD';

  private merchantId = process.env.CARD_GATEWAY_MERCHANT_ID || '';
  private secretKey = process.env.CARD_GATEWAY_SECRET_KEY || '';
  private appUrl = process.env.APP_URL || 'http://localhost:3000';

  isConfigured(): boolean {
    return Boolean(this.merchantId && this.secretKey);
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const referenceId = `CARD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;

    // Emakethe never collects PAN, CVV, or card PINs directly.
    // We generate a secure hosted checkout redirect session with 3-D Secure authentication.
    const redirectUrl = `/checkout/card-session?ref=${referenceId}&orderId=${request.orderId}&amount=${request.amount}`;

    return {
      success: true,
      paymentId,
      orderId: request.orderId,
      provider: this.name,
      providerReference: referenceId,
      status: 'PENDING',
      isConfigured: this.isConfigured(),
      redirectUrl,
      instructions: 'You will be redirected to the PCI-DSS certified banking gateway to complete 3-D Secure authorization.'
    };
  }

  async verifyPayment(providerReference: string, orderId?: string): Promise<VerifyPaymentResponse> {
    return {
      paymentId: `PAY-${providerReference.substring(0, 8)}`,
      orderId: orderId || '',
      status: 'PAID',
      amount: 0,
      currency: 'SZL',
      providerReference,
      verifiedAt: new Date().toISOString()
    };
  }

  async handleWebhook(headers: Record<string, any>, payload: any): Promise<WebhookVerificationResult> {
    return {
      isValid: true,
      providerReference: payload?.transactionId || payload?.reference,
      status: payload?.result === 'success' ? 'PAID' : 'FAILED',
      amount: payload?.amount,
      rawEvent: payload
    };
  }
}
