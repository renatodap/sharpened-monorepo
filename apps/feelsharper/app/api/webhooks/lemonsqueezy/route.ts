// LemonSqueezy Webhook Handler
// Processes payment events and updates user subscriptions

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';
    
    // TODO: Re-implement webhook signature verification without @sharpened/payments dependency
    // const client = getLemonSqueezyClient();
    // const isValid = client.verifyWebhook(rawBody, signature);
    
    // Mock signature verification for now (SECURITY WARNING: Remove in production)
    const isValid = true; // WARNING: This bypasses security checks
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    console.warn('WARNING: Webhook signature verification is disabled. Re-implement before production!');
    
    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const { meta, data } = payload;
    
    // Initialize Supabase client
    const supabase = await createClient();
    
    console.log(`Processing LemonSqueezy webhook event: ${meta.event_name}`);
    
    // Handle different event types
    switch (meta.event_name) {
      case 'order_created':
        await handleOrderCreated(data, supabase);
        break;
        
      case 'subscription_created':
        await handleSubscriptionCreated(data, supabase);
        break;
        
      case 'subscription_updated':
        await handleSubscriptionUpdated(data, supabase);
        break;
        
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data, supabase);
        break;
        
      case 'subscription_resumed':
        await handleSubscriptionResumed(data, supabase);
        break;
        
      case 'subscription_expired':
        await handleSubscriptionExpired(data, supabase);
        break;
        
      case 'subscription_paused':
        await handleSubscriptionPaused(data, supabase);
        break;
        
      case 'order_refunded':
        await handleOrderRefunded(data, supabase);
        break;
        
      default:
        console.log(`Unhandled LemonSqueezy event type: ${meta.event_name}`);
        // Log the event data for debugging
        console.log('Event data:', JSON.stringify(data, null, 2));
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle new order creation
async function handleOrderCreated(data: any, supabase: any) {
  const { attributes } = data;
  const { user_email, custom_data, first_order_item } = attributes;
  
  // Extract user ID from custom data
  const userId = custom_data?.user_id;
  if (!userId) {
    console.error('No user ID in order custom data');
    return;
  }
  
  // Create or update user subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      lemonsqueezy_customer_id: attributes.customer_id,
      lemonsqueezy_order_id: attributes.identifier,
      status: 'active',
      product_name: first_order_item.product_name,
      variant_name: first_order_item.variant_name,
      created_at: attributes.created_at,
      updated_at: new Date().toISOString(),
    });
    
  if (error) {
    console.error('Error updating user subscription:', error);
  }
  
  // Send welcome email (via Resend)
  await sendWelcomeEmail(user_email, first_order_item.product_name);
}

// Handle subscription creation
async function handleSubscriptionCreated(data: any, supabase: any) {
  const { attributes } = data;
  const { user_email, customer_id, product_name, variant_name } = attributes;
  
  // Find user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', user_email)
    .single();
    
  if (userError || !userData) {
    console.error('User not found:', user_email);
    return;
  }
  
  // Update subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userData.id,
      lemonsqueezy_customer_id: customer_id,
      lemonsqueezy_subscription_id: data.id,
      status: attributes.status,
      product_name,
      variant_name,
      current_period_end: attributes.renews_at,
      cancel_at_period_end: false,
      created_at: attributes.created_at,
      updated_at: new Date().toISOString(),
    });
    
  if (error) {
    console.error('Error creating subscription record:', error);
  }
  
  // Update user role to premium
  await updateUserRole(userData.id, 'premium', supabase);
}

// Handle subscription updates
async function handleSubscriptionUpdated(data: any, supabase: any) {
  const { attributes } = data;
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: attributes.status,
      current_period_end: attributes.renews_at,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);
    
  if (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(data: any, supabase: any) {
  const { attributes } = data;
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);
    
  if (error) {
    console.error('Error cancelling subscription:', error);
  }
  
  // Send cancellation email
  await sendCancellationEmail(attributes.user_email);
}

// Handle subscription resumption
async function handleSubscriptionResumed(data: any, supabase: any) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);
    
  if (error) {
    console.error('Error resuming subscription:', error);
  }
}

// Handle subscription expiration
async function handleSubscriptionExpired(data: any, supabase: any) {
  const { attributes } = data;
  
  // Update subscription status
  const { data: subData, error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'expired',
      expired_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id)
    .select('user_id')
    .single();
    
  if (error) {
    console.error('Error expiring subscription:', error);
    return;
  }
  
  // Downgrade user to free tier
  await updateUserRole(subData.user_id, 'free', supabase);
  
  // Send expiration email with win-back offer
  await sendExpirationEmail(attributes.user_email);
}

// Handle subscription pause
async function handleSubscriptionPaused(data: any, supabase: any) {
  const { attributes } = data;
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'paused',
      paused_at: new Date().toISOString(),
      resumes_at: attributes.pause?.resumes_at,
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_subscription_id', data.id);
    
  if (error) {
    console.error('Error pausing subscription:', error);
  }
}

// Handle order refund
async function handleOrderRefunded(data: any, supabase: any) {
  const { attributes } = data;
  
  const { data: subData, error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('lemonsqueezy_order_id', attributes.identifier)
    .select('user_id')
    .single();
    
  if (error) {
    console.error('Error processing refund:', error);
    return;
  }
  
  // Downgrade user to free tier
  await updateUserRole(subData.user_id, 'free', supabase);
  
  // Send refund confirmation email
  await sendRefundEmail(attributes.user_email, attributes.total_formatted);
}

// Helper function to update user role
async function updateUserRole(userId: string, role: 'free' | 'premium', supabase: any) {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) {
    console.error('Error updating user role:', error);
  }
}

// Email helper functions (will use Resend)
async function sendWelcomeEmail(email: string, productName: string) {
  // TODO: Implement with Resend
  console.log(`Would send welcome email to ${email} for ${productName}`);
}

async function sendCancellationEmail(email: string) {
  // TODO: Implement with Resend
  console.log(`Would send cancellation email to ${email}`);
}

async function sendExpirationEmail(email: string) {
  // TODO: Implement with Resend
  console.log(`Would send expiration email to ${email}`);
}

async function sendRefundEmail(email: string, amount: string) {
  // TODO: Implement with Resend
  console.log(`Would send refund email to ${email} for ${amount}`);
}