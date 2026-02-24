import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const PLANS = {
  monthly: {
    priceId: 'price_MONTHLY_ID', // à remplacer après création dans Stripe
    name: 'Mensuel',
    price: 4.99,
    interval: 'month',
    trialDays: 0,
  },
  quarterly: {
    priceId: 'price_QUARTERLY_ID',
    name: 'Trimestriel', 
    price: 12.99,
    interval: 'quarter',
    savings: '-13%',
  },
  yearly: {
    priceId: 'price_YEARLY_ID',
    name: 'Annuel',
    price: 35.99,
    interval: 'year',
    savings: '-40%',
  },
};
