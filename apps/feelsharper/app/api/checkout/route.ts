import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-implement LemonSqueezy payments without @sharpened/payments dependency
// import { getLemonSqueezyClient } from '@sharpened/payments';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan, userId } = body;

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    // Get user from session if not provided
    let currentUserId = userId;
    if (!currentUserId) {
      const supabase = createServerClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      currentUserId = user.id;
    }

    // Map plan to variant ID (these will need to be filled after creating products in LemonSqueezy)
    const variantIds = {
      premium: process.env.LEMONSQUEEZY_PREMIUM_MONTHLY_VARIANT_ID,
      annual: process.env.LEMONSQUEEZY_PREMIUM_ANNUAL_VARIANT_ID,
    };

    const variantId = variantIds[plan as keyof typeof variantIds];
    
    if (!variantId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // TODO: Re-implement LemonSqueezy checkout creation without @sharpened/payments dependency
    // const lemonSqueezy = getLemonSqueezyClient();
    
    const customData = {
      user_id: currentUserId,
      source: 'website',
      plan: plan,
    };

    // Mock checkout URL for now (replace with actual implementation)
    // const checkoutUrl = await lemonSqueezy.createCheckout(variantId, customData);
    const checkoutUrl = `https://checkout-mock.lemonsqueezy.com/${variantId}?user_id=${currentUserId}&plan=${plan}`;
    
    console.log('Mock checkout created for:', { variantId, plan, userId: currentUserId });
    console.warn('WARNING: Using mock checkout URL. Implement LemonSqueezy integration before production!');

    return NextResponse.json({ 
      success: true, 
      checkoutUrl,
      message: 'Checkout created successfully' 
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}