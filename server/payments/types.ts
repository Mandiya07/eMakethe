export type PaymentMethod =
  | 'MTN_MOMO'
  | 'CARD'
  | 'COD'
  | 'PAY_ON_COLLECTION'
  | 'WHATSAPP_LINK';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface InitiatePaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  seller: {
    id: string;
    name: string;
    phone?: string;
    whatsapp?: string;
  };
  idempotencyKey?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  provider: string;
  providerReference: string;
  status: PaymentStatus;
  isConfigured: boolean;
  redirectUrl?: string;
  instructions?: string;
  pollUrl?: string;
  rawResponse?: any;
  error?: string;
}

export interface VerifyPaymentResponse {
  paymentId: string;
  orderId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerReference: string;
  verifiedAt: string;
  rawResponse?: any;
  error?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderId?: string;
  paymentId?: string;
  providerReference?: string;
  status?: PaymentStatus;
  amount?: number;
  rawEvent?: any;
  error?: string;
}

export interface IPaymentProvider {
  readonly name: string;
  readonly method: PaymentMethod;
  isConfigured(): boolean;
  initiatePayment(request: InitiatePaymentRequest): Promise<InitiatePaymentResponse>;
  verifyPayment(providerReference: string, orderId?: string): Promise<VerifyPaymentResponse>;
  handleWebhook(headers: Record<string, any>, payload: any): Promise<WebhookVerificationResult>;
}
