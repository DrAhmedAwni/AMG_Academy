export interface PaymentIntent {
  id: string;
  status: string;
  amount: number;
  currency: string;
  reference: string;
}

export interface IPaymentProvider {
  name: string;
  createPayment(amount: number, currency: string, reference: string): Promise<PaymentIntent>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
  getPaymentStatus(providerReference: string): Promise<string>;
}
