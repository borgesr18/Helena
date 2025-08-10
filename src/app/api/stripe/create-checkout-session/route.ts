import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCurrentUserServer } from '@/lib/auth-server';
import { stripeService } from '@/lib/stripeService';

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 });
    }

    const user = await getCurrentUserServer();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }


    const { planId, clinicaId, successUrl, cancelUrl } = await request.json();

    if (!planId || !clinicaId) {
      return NextResponse.json(
        { error: 'planId e clinicaId são obrigatórios' },
        { status: 400 }
      );
    }

    const plan = stripeService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    if (plan.price === 0) {
      return NextResponse.json(
        { error: 'Plano gratuito não requer checkout' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: `Helena ${plan.name}`,
              description: plan.features.join(', '),
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
        clinicaId,
        userId: user.id,
      },
      customer_email: user.email,
      locale: 'pt-BR',
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
