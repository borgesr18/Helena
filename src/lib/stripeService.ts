import { loadStripe, Stripe } from '@stripe/stripe-js';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  maxUsers: number;
  maxPrescriptions: number;
}

export interface PaymentSession {
  sessionId: string;
  url: string;
  customerId?: string;
}

export interface BillingPortalSession {
  url: string;
}

export class StripeService {
  private stripe: Stripe | null = null;
  private publishableKey: string;

  constructor() {
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  }

  public async initialize(): Promise<void> {
    if (!this.publishableKey) {
      throw new Error('Stripe publishable key not configured');
    }

    this.stripe = await loadStripe(this.publishableKey);
    
    if (!this.stripe) {
      throw new Error('Failed to initialize Stripe');
    }
  }

  public getPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'helena_free',
        name: 'Gratuito',
        price: 0,
        currency: 'BRL',
        interval: 'month',
        features: [
          '1 usuário',
          '50 prescrições/mês',
          'Suporte básico',
          'Backup automático'
        ],
        maxUsers: 1,
        maxPrescriptions: 50
      },
      {
        id: 'helena_basic',
        name: 'Básico',
        price: 4900, // R$ 49,00 em centavos
        currency: 'BRL',
        interval: 'month',
        features: [
          '5 usuários',
          '500 prescrições/mês',
          'IA avançada',
          'Detecção de interações',
          'Suporte prioritário',
          'Multi-clínica'
        ],
        maxUsers: 5,
        maxPrescriptions: 500
      },
      {
        id: 'helena_premium',
        name: 'Premium',
        price: 9900, // R$ 99,00 em centavos
        currency: 'BRL',
        interval: 'month',
        features: [
          'Usuários ilimitados',
          'Prescrições ilimitadas',
          'Assinatura digital ICP-Brasil',
          'Validação CFM',
          'Compliance total',
          'API personalizada',
          'Suporte 24/7'
        ],
        maxUsers: -1, // Ilimitado
        maxPrescriptions: -1 // Ilimitado
      },
      {
        id: 'helena_premium_annual',
        name: 'Premium Anual',
        price: 99000, // R$ 990,00 em centavos (2 meses grátis)
        currency: 'BRL',
        interval: 'year',
        features: [
          'Usuários ilimitados',
          'Prescrições ilimitadas',
          'Assinatura digital ICP-Brasil',
          'Validação CFM',
          'Compliance total',
          'API personalizada',
          'Suporte 24/7',
          '2 meses grátis'
        ],
        maxUsers: -1,
        maxPrescriptions: -1
      }
    ];
  }

  public async createCheckoutSession(
    planId: string,
    clinicaId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<PaymentSession> {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        clinicaId,
        userId,
        successUrl,
        cancelUrl
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return await response.json();
  }

  public async redirectToCheckout(sessionId: string): Promise<void> {
    if (!this.stripe) {
      await this.initialize();
    }

    const { error } = await this.stripe!.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message);
    }
  }

  public async createBillingPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<BillingPortalSession> {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create billing portal session');
    }

    return await response.json();
  }

  public async getSubscriptionStatus(clinicaId: string): Promise<{ status: string; plan: string; nextBilling?: Date }> {
    const response = await fetch(`/api/stripe/subscription-status?clinicaId=${clinicaId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription status');
    }

    return await response.json();
  }

  public formatPrice(amount: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  }

  public getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.getPlans().find(plan => plan.id === planId);
  }
}

export const stripeService = new StripeService();
