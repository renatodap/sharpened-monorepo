// LemonSqueezy Payment Configuration
// Based on owner decision DG-005: Cheapest/easiest option

export const LEMONSQUEEZY_CONFIG = {
  // API Configuration
  api: {
    baseUrl: 'https://api.lemonsqueezy.com/v1',
    version: 'v1',
  },
  
  // Product IDs (to be filled after creating products in LemonSqueezy)
  products: {
    free: {
      id: '', // Will be filled after product creation
      name: 'Feel Sharper Free',
      price: 0,
      features: [
        'Core tracking features',
        '7-day history',
        '1 micro-league',
        'Basic insights',
      ],
    },
    premium: {
      monthly: {
        id: '', // Will be filled after product creation
        name: 'Feel Sharper Premium',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
      },
      yearly: {
        id: '', // Will be filled after product creation
        name: 'Feel Sharper Premium (Annual)',
        price: 99, // Save $20
        currency: 'USD',
        interval: 'year',
      },
      features: [
        'Everything in Free',
        'Unlimited history',
        'Unlimited micro-leagues',
        'AI coaching',
        'Advanced analytics',
        'Priority support',
        'Custom themes',
        'Export data',
        'API access',
      ],
    },
  },
  
  // Webhook configuration
  webhooks: {
    endpoints: {
      feelsharper: '/api/webhooks/lemonsqueezy',
      studysharper: '/api/webhooks/lemonsqueezy',
    },
    events: [
      'order_created',
      'order_refunded',
      'subscription_created',
      'subscription_updated',
      'subscription_cancelled',
      'subscription_resumed',
      'subscription_expired',
      'subscription_paused',
      'subscription_unpaused',
      'license_key_created',
    ],
  },
  
  // Checkout configuration
  checkout: {
    settings: {
      dark: true, // Match our dark theme
      logo: true,
      show_product_name: true,
      show_description: true,
      button_color: '#0B2A4A', // Navy from brand
    },
    customData: {
      user_id: '', // Will be populated dynamically
      source: '', // Track where conversion came from
    },
  },
  
  // Discount codes
  discounts: {
    launch: {
      code: 'LAUNCH50',
      percentage: 50,
      duration: 'once',
      validUntil: '2025-02-28',
    },
    student: {
      code: 'STUDENT20',
      percentage: 20,
      duration: 'forever',
      requiresVerification: true,
    },
    referral: {
      code: 'FRIEND10',
      percentage: 10,
      duration: '3_months',
    },
  },
  
  // Test mode configuration
  test: {
    enabled: process.env.NODE_ENV !== 'production',
    testCards: [
      { number: '4242424242424242', brand: 'Visa', result: 'success' },
      { number: '4000000000000002', brand: 'Visa', result: 'decline' },
      { number: '4000000000000069', brand: 'Visa', result: 'expired' },
    ],
  },
};

// Helper functions for LemonSqueezy integration
export class LemonSqueezyClient {
  private apiKey: string;
  private webhookSecret: string;

  constructor(apiKey: string, webhookSecret: string) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
  }

  // Create checkout URL
  async createCheckout(variantId: string, customData: any = {}) {
    const response = await fetch(`${LEMONSQUEEZY_CONFIG.api.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            variant_id: variantId,
            custom_data: customData,
            checkout_options: LEMONSQUEEZY_CONFIG.checkout.settings,
          },
        },
      }),
    });

    const data = await response.json();
    return data.data.attributes.url;
  }

  // Get subscription status
  async getSubscription(subscriptionId: string) {
    const response = await fetch(
      `${LEMONSQUEEZY_CONFIG.api.baseUrl}/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return response.json();
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    const response = await fetch(
      `${LEMONSQUEEZY_CONFIG.api.baseUrl}/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    return response.json();
  }

  // Pause subscription
  async pauseSubscription(subscriptionId: string, resumesAt?: Date) {
    const response = await fetch(
      `${LEMONSQUEEZY_CONFIG.api.baseUrl}/subscriptions/${subscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            id: subscriptionId,
            attributes: {
              pause: {
                mode: resumesAt ? 'until' : 'free',
                resumes_at: resumesAt?.toISOString(),
              },
            },
          },
        }),
      }
    );

    return response.json();
  }

  // Update payment method
  async updatePaymentMethod(subscriptionId: string) {
    const response = await fetch(
      `${LEMONSQUEEZY_CONFIG.api.baseUrl}/subscriptions/${subscriptionId}/update-payment-method`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    const data = await response.json();
    return data.data.attributes.url; // Returns update URL
  }

  // Verify webhook signature
  verifyWebhook(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(payload);
    const digest = hmac.digest('hex');
    return digest === signature;
  }

  // Get customer portal URL
  async getCustomerPortal(customerId: string) {
    const response = await fetch(
      `${LEMONSQUEEZY_CONFIG.api.baseUrl}/customers/${customerId}/portal`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );

    const data = await response.json();
    return data.data.attributes.url;
  }

  // Apply discount code
  async validateDiscount(code: string, variantId: string) {
    // LemonSqueezy handles this at checkout
    // This is a placeholder for custom validation if needed
    const discount = Object.values(LEMONSQUEEZY_CONFIG.discounts).find(
      d => d.code === code
    );
    
    if (!discount) return null;
    
    // Check if discount is still valid
    if (discount.validUntil) {
      const validDate = new Date(discount.validUntil);
      if (validDate < new Date()) return null;
    }
    
    return discount;
  }
}

// Export singleton instance
let client: LemonSqueezyClient | null = null;

export function getLemonSqueezyClient(): LemonSqueezyClient {
  if (!client) {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    
    if (!apiKey || !webhookSecret) {
      throw new Error('LemonSqueezy API key or webhook secret not configured');
    }
    
    client = new LemonSqueezyClient(apiKey, webhookSecret);
  }
  
  return client;
}