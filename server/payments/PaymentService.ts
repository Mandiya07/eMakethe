import { IPaymentProvider, PaymentMethod, InitiatePaymentRequest, InitiatePaymentResponse, VerifyPaymentResponse, WebhookVerificationResult } from './types';
import { MtnMomoProvider } from './MtnMomoProvider';
import { CardProvider } from './CardProvider';
import { CodProvider, PayOnCollectionProvider, WhatsAppPaymentProvider } from './OfflineProviders';

export class PaymentService {
  private providers: Map<PaymentMethod, IPaymentProvider> = new Map();

  constructor() {
    this.registerProvider(new MtnMomoProvider());
    this.registerProvider(new CardProvider());
    this.registerProvider(new CodProvider());
    this.registerProvider(new PayOnCollectionProvider());
    this.registerProvider(new WhatsAppPaymentProvider());
  }

  registerProvider(provider: IPaymentProvider) {
    this.providers.set(provider.method, provider);
  }

  getProvider(method: PaymentMethod): IPaymentProvider {
    const provider = this.providers.get(method);
    if (!provider) {
      throw new Error(`Unsupported payment method: ${method}`);
    }
    return provider;
  }

  getAvailableMethods(): Array<{ method: PaymentMethod; name: string; isConfigured: boolean }> {
    const list: Array<{ method: PaymentMethod; name: string; isConfigured: boolean }> = [];
    this.providers.forEach((p, method) => {
      list.push({
        method,
        name: p.name,
        isConfigured: p.isConfigured()
      });
    });
    return list;
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> {
    const provider = this.getProvider(request.paymentMethod);
    return await provider.initiatePayment(request);
  }

  async verifyPayment(method: PaymentMethod, providerReference: string, orderId?: string): Promise<VerifyPaymentResponse> {
    const provider = this.getProvider(method);
    return await provider.verifyPayment(providerReference, orderId);
  }

  async handleWebhook(providerName: string, headers: Record<string, any>, payload: any): Promise<WebhookVerificationResult> {
    // Find matching provider
    for (const provider of this.providers.values()) {
      if (provider.name.toLowerCase().includes(providerName.toLowerCase()) || provider.method.toLowerCase() === providerName.toLowerCase()) {
        return await provider.handleWebhook(headers, payload);
      }
    }
    return { isValid: false, error: `Provider ${providerName} not found for webhook` };
  }
}

export const paymentService = new PaymentService();
