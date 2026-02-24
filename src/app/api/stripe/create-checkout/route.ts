import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/pocketbase';

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, userEmail } = await request.json();
    
    const plans: Record<string, string> = {
      monthly: process.env.STRIPE_PRICE_MONTHLY!,
      quarterly: process.env.STRIPE_PRICE_QUARTERLY!,
      yearly: process.env.STRIPE_PRICE_YEARLY!,
    };

    const priceId = plans[planId];
    if (!priceId) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const adminPb = await getAdminClient();
    const user = await adminPb.collection('users').getOne(userId, { 
      requestKey: null 
    });

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { pocketbase_user_id: userId },
      });
      customerId = customer.id;
      await adminPb.collection('users').update(userId, {
        stripe_customer_id: customerId,
      }, { requestKey: null });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
      metadata: { userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
