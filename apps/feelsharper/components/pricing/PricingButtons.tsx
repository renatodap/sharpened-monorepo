"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingButtonProps {
  plan: 'premium' | 'annual';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PricingButton({ plan, children, className = '', disabled = false }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // First check if user is authenticated
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // User needs to sign in first
          router.push(`/sign-in?redirect=/checkout&plan=${plan}`);
          return;
        }
        throw new Error(data.error || 'Failed to create checkout');
      }

      if (data.checkoutUrl) {
        // Redirect to LemonSqueezy checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${className} ${
        loading ? 'opacity-75 cursor-wait' : ''
      } ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } transition-all duration-200`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export function FreePlanButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/sign-up');
  };

  return (
    <button
      onClick={handleClick}
      className={`${className} transition-all duration-200`}
    >
      {children}
    </button>
  );
}