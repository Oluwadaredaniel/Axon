import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2026-02-25.clover',
});

export const stripeService = {

  // Create a customer
  async createCustomer(email: string, name: string): Promise<string> {
    const customer = await stripe.customers.create({ email, name });
    return customer.id;
  },

  // Create checkout session
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    userId: string,
    plan: string
  ): Promise<string> {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${env.frontendUrl}/dashboard?upgraded=true&plan=${plan}`,
      cancel_url: `${env.frontendUrl}/pricing?cancelled=true`,
      metadata: { userId, plan },
    });
    return session.url || '';
  },

  // Create billing portal session
  async createPortalSession(customerId: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.frontendUrl}/dashboard/billing`,
    });
    return session.url;
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  },

  // Get subscription
  async getSubscription(subscriptionId: string) {
    return stripe.subscriptions.retrieve(subscriptionId);
  },

  // Construct webhook event
  constructWebhookEvent(payload: Buffer, signature: string) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripe.webhookSecret
    );
  },
};