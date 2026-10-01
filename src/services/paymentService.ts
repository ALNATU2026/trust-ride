import { PaymentMethod } from '../types';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'SLE';
  channel: PaymentMethod;
  phoneNumber?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference: string;
  instructions: string;
}

export class PaymentService {
  private static instance: PaymentService;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async initiateMobileMoneyPayment(
    amount: number,
    channel: PaymentMethod,
    phoneNumber: string,
    description: string
  ): Promise<PaymentIntent> {
    const reference = 'TR-' + Date.now().toString().slice(-6) + '-' + Math.floor(100 + Math.random() * 900);

    let instructions = '';
    if (channel === 'orange_money') {
      instructions = `Dial *144# on ${phoneNumber} and approve payment of SLE ${amount.toFixed(2)} to Trust Ride SL (Code: 84920).`;
    } else if (channel === 'afrimoney') {
      instructions = `Dial *161# on ${phoneNumber} and enter your PIN to authorize SLE ${amount.toFixed(2)} transfer.`;
    } else {
      instructions = `Pay SLE ${amount.toFixed(2)} directly in cash or through Trust Ride Wallet.`;
    }

    return {
      id: `pi_${Date.now()}`,
      amount,
      currency: 'SLE',
      channel,
      phoneNumber,
      status: 'PENDING',
      reference,
      instructions,
    };
  }
}
