import { Injectable } from '@nestjs/common';
import type { IPaymentProvider, PaymentIntent } from './ipayment-provider';

@Injectable()
export class ManualPaymentProvider implements IPaymentProvider {
  readonly name = 'manual';

  async createPayment(amount: number, currency: string, reference: string): Promise<PaymentIntent> {
    return {
      id: `manual-${reference}`,
      status: 'pending',
      amount,
      currency,
      reference,
    };
  }

  async verifyWebhook(_payload: unknown, _signature: string): Promise<boolean> {
    return true;
  }

  async getPaymentStatus(_providerReference: string): Promise<string> {
    return 'pending';
  }
}
