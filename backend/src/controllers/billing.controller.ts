import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { stripeService } from '../services/stripe.service';
import { emailService } from '../services/email.service';
import { env } from '../config/env';

export const billingController = {

  // Create checkout session
  async createCheckout(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { plan } = req.body;

      if (!plan || !['pro', 'team'].includes(plan)) {
        return res.status(400).json({ error: 'Valid plan is required' });
      }

      // Get user profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) return res.status(404).json({ error: 'User not found' });

      // Get plan price ID from database
      const { data: planData } = await supabaseAdmin
        .from('plans')
        .select('stripe_price_id_monthly, name')
        .eq('id', plan)
        .single();

      if (!planData?.stripe_price_id_monthly) {
        return res.status(400).json({
          error: 'Plan not configured for payments yet',
        });
      }

      // Create or get Stripe customer
      let customerId = profile.stripe_customer_id;
      if (!customerId) {
        customerId = await stripeService.createCustomer(
          profile.email,
          profile.full_name
        );
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId);
      }

      // Create checkout session
      const url = await stripeService.createCheckoutSession(
        customerId,
        planData.stripe_price_id_monthly,
        userId,
        plan
      );

      return res.json({ url });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Open billing portal
  async createPortal(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (!profile?.stripe_customer_id) {
        return res.status(400).json({ error: 'No billing account found' });
      }

      const url = await stripeService.createPortalSession(
        profile.stripe_customer_id
      );

      return res.json({ url });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Cancel subscription
  async cancel(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_subscription_id')
        .eq('id', userId)
        .single();

      if (!profile?.stripe_subscription_id) {
        return res.status(400).json({ error: 'No active subscription found' });
      }

      await stripeService.cancelSubscription(profile.stripe_subscription_id);

      return res.json({
        message: 'Subscription will cancel at end of billing period',
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get current billing info
  async getBilling(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('plan, stripe_customer_id, stripe_subscription_id')
        .eq('id', userId)
        .single();

      if (!profile) return res.status(404).json({ error: 'User not found' });

      let subscription = null;
      if (profile.stripe_subscription_id) {
        subscription = await stripeService.getSubscription(
          profile.stripe_subscription_id
        );
      }

      const { data: planData } = await supabaseAdmin
        .from('plans')
        .select('*')
        .eq('id', profile.plan)
        .single();

      return res.json({
        plan: profile.plan,
        planDetails: planData,
        subscription: subscription
          ? {
              status: subscription.status,
              currentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ).toISOString(),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }
          : null,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Stripe webhook handler
  async webhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string;

    let event;
    try {
      event = stripeService.constructWebhookEvent(
        req.body,
        signature
      );
    } catch (err) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          const { userId, plan } = session.metadata;

          const { data: planData } = await supabaseAdmin
            .from('plans')
            .select('ai_requests_limit')
            .eq('id', plan)
            .single();

          await supabaseAdmin
            .from('profiles')
            .update({
              plan,
              stripe_subscription_id: session.subscription,
              ai_requests_limit: planData?.ai_requests_limit || 999999,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();

          if (profile) {
            const amount = plan === 'pro' ? 9 : 24;
            await emailService.sendPaymentSuccess(
              profile.email,
              profile.full_name,
              plan,
              amount
            );
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          const customerId = invoice.customer;

          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await emailService.sendPaymentFailed(
              profile.email,
              profile.full_name,
              `${env.frontendUrl}/dashboard/billing`
            );
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          const customerId = subscription.customer;

          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              stripe_subscription_id: null,
              ai_requests_limit: 50,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
          break;
        }
      }

      return res.json({ received: true });
    } catch (err) {
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  },
};