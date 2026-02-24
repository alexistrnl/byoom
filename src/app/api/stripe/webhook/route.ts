import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Erreur vérification signature webhook:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  console.log('Webhook reçu:', event.type);

  const adminPb = await getAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      console.log('UserId depuis metadata:', userId);
      const subscriptionId = session.subscription;
      
      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const endDate = new Date(subscription.current_period_end * 1000);
        
        console.log('Mise à jour user:', userId, 'avec subscription:', subscriptionId);
        const updated = await adminPb.collection('users').update(userId, {
          subscription_plan: 'premium',
          subscription_status: 'active',
          subscription_end_date: endDate.toISOString(),
          stripe_subscription_id: subscriptionId,
        }, { requestKey: null });
        console.log('User mis à jour:', updated.id, updated.subscription_plan);
      } else {
        console.warn('UserId ou subscriptionId manquant:', { userId, subscriptionId });
      }
      break;
    }
    
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused': {
      const subscription = event.data.object as any;
      const customer = await stripe.customers.retrieve(
        subscription.customer as string
      ) as any;
      const userId = customer.metadata?.pocketbase_user_id;
      console.log('Subscription deleted/paused, userId:', userId);
      
      if (userId) {
        await adminPb.collection('users').update(userId, {
          subscription_plan: 'free',
          subscription_status: 'cancelled',
        }, { requestKey: null });
        console.log('User mis à jour vers free:', userId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;
      const customer = await stripe.customers.retrieve(
        subscription.customer as string
      ) as any;
      const userId = customer.metadata?.pocketbase_user_id;
      console.log('Subscription updated, userId:', userId, 'status:', subscription.status);
      
      if (userId) {
        const endDate = new Date(subscription.current_period_end * 1000);
        await adminPb.collection('users').update(userId, {
          subscription_status: subscription.status === 'active' 
            ? 'active' : 'expired',
          subscription_end_date: endDate.toISOString(),
        }, { requestKey: null });
        console.log('User subscription mis à jour:', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
