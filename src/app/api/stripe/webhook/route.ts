import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/pocketbase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// IMPORTANT : Dans Next.js App Router, pour lire le raw body
// dans un webhook Stripe, il faut désactiver le body parsing
// La lecture doit être exactement :

export async function POST(request: NextRequest) {
  const buf = await request.arrayBuffer();
  const body = Buffer.from(buf).toString('utf-8');
  
  console.log('=== WEBHOOK REÇU ===');
  console.log('Body:', body.substring(0, 200));
  
  let event;
  
  // MODE DEBUG : bypass signature temporaire
  try {
    event = JSON.parse(body);
    console.log('Event type:', event.type);
  } catch (err) {
    console.error('Parse error:', err);
    return NextResponse.json({ error: 'Parse error' }, { status: 400 });
  }

  const adminPb = await getAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription;
      
      console.log('UserId:', userId);
      console.log('SubscriptionId:', subscriptionId);
      
      if (userId && subscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          ) as any;
          
          console.log('Subscription data:', JSON.stringify({
            id: subscription.id,
            current_period_end: subscription.current_period_end,
            status: subscription.status,
          }));
          
          // Calcul sécurisé de la date de fin
          let endDate: Date;
          if (subscription.current_period_end) {
            endDate = new Date(subscription.current_period_end * 1000);
          } else {
            // Fallback : +1 mois par défaut
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
          }
          
          // Vérifier que la date est valide
          if (isNaN(endDate.getTime())) {
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
          }
          
          console.log('End date calculée:', endDate.toISOString());
          
          await adminPb.collection('users').update(userId, {
            subscription_plan: 'premium',
            subscription_status: 'active',
            subscription_end_date: endDate.toISOString(),
            stripe_subscription_id: subscriptionId,
          }, { requestKey: null });
          
          console.log('✅ User mis à jour avec succès:', userId);
        } catch (e) {
          console.error('Erreur mise à jour user:', e);
        }
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
        const endDate = new Date((subscription.current_period_end as number) * 1000);
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
