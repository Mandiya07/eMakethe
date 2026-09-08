import { IPaymentProvider, InitiatePaymentRequest, InitiatePaymentResponse, VerifyPaymentResponse, WebhookVerificationResult, PaymentMethod } from './types';
import crypto from 'crypto';

export class CodProvider implements IPaymentProvider {
  readonly name = 'Cash on Delivery';
  readonly method: PaymentMethod = 'COD';

  isConfigured(): boolean {
    return true;
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const referenceId = `COD-${Date.now().toString(36).toUpperCase()}`;
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      paymentId,
      orderId: request.orderId,
      provider: this.name,
      providerReference: referenceId,
      status: 'UNPAID',
      isConfigured: true,
      instructions: `Please have exact cash of E ${request.amount.toFixed(2)} ready upon delivery by the trader or courier.`
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

  async handleWebhook(): Promise<WebhookVerificationResult> {
    return { isValid: false, error: 'COD does not support webhooks' };
  }
}

export class PayOnCollectionProvider implements IPaymentProvider {
  readonly name = 'Pay on Collection';
  readonly method: PaymentMethod = 'PAY_ON_COLLECTION';

  isConfigured(): boolean {
    return true;
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const referenceId = `COL-${Date.now().toString(36).toUpperCase()}`;
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      paymentId,
      orderId: request.orderId,
      provider: this.name,
      providerReference: referenceId,
      status: 'UNPAID',
      isConfigured: true,
      instructions: `Pay with cash, MoMo, or card when collecting your package at ${request.seller.name}'s stall.`
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

  async handleWebhook(): Promise<WebhookVerificationResult> {
    return { isValid: false, error: 'Collection does not support webhooks' };
  }
}

export class WhatsAppPaymentProvider implements IPaymentProvider {
  readonly name = 'WhatsApp Direct Payment Link';
  readonly method: PaymentMethod = 'WHATSAPP_LINK';

  isConfigured(): boolean {
    return true;
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const referenceId = `WA-${Date.now().toString(36).toUpperCase()}`;
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;

    const sellerPhone = (request.seller.whatsapp || request.seller.phone || '+268 7600 0000').replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Hello ${request.seller.name}! I would like to pay for Order #${request.orderNumber} (Amount: E ${request.amount.toFixed(2)}). My name is ${request.customer.name}. Please confirm your preferred MoMo / eMali / Bank details!`
    );
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${message}`;

    return {
      success: true,
      paymentId,
      orderId: request.orderId,
      provider: this.name,
      providerReference: referenceId,
      status: 'PENDING',
      isConfigured: true,
      redirectUrl: whatsappUrl,
      instructions: 'Chat directly with the merchant on WhatsApp to settle payment via MoMo or cash.'
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

  async handleWebhook(): Promise<WebhookVerificationResult> {
    return { isValid: false, error: 'WhatsApp link does not support webhooks' };
  }
}
