import { Metadata } from 'next';
import FitnessHero from '@/components/home/FitnessHero';
import SimpleHeader from '@/components/navigation/SimpleHeader';
import { PricingButton, FreePlanButton } from '@/components/pricing/PricingButtons';

export const metadata: Metadata = {
  title: 'Feel Sharper | Free Fitness Tracker',
  description: 'Track food, workouts, and weight with clean graphs. Free forever with premium features available.',
};

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      <SimpleHeader />
      {/* Hero Section */}
      <FitnessHero />
      
      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-text-secondary mb-16">
            Start free. Upgrade when you need more.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-surface border border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Free</h3>
              <div className="text-4xl font-bold text-navy mb-6">$0<span className="text-xl text-text-secondary font-normal">/month</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Basic food logging
                </li>
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Simple workout tracking
                </li>
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Weight tracking
                </li>
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Basic progress graphs
                </li>
              </ul>
              <FreePlanButton className="block w-full py-3 px-6 text-center font-semibold text-text-primary bg-surface-2 border border-border rounded-xl hover:bg-navy hover:text-white transition-all duration-200">
                Get Started
              </FreePlanButton>
            </div>
            
            {/* Premium Tier */}
            <div className="bg-navy border-2 border-navy rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-success text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
              <div className="text-4xl font-bold text-white mb-6">$9.99<span className="text-xl text-gray-300 font-normal">/month</span></div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Everything in Free
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  AI-powered workout parsing
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Advanced progress analytics
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Personal AI coach
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Unlimited meal templates
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Streak system with rewards
                </li>
              </ul>
              <PricingButton plan="premium" className="block w-full py-3 px-6 text-center font-semibold text-navy bg-white rounded-xl hover:bg-gray-100 transition-all duration-200">
                Start Premium
              </PricingButton>
            </div>
            
            {/* Annual Tier */}
            <div className="bg-surface border border-border rounded-xl p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-2">Premium Annual</h3>
              <div className="text-4xl font-bold text-navy mb-2">$99<span className="text-xl text-text-secondary font-normal">/year</span></div>
              <div className="text-sm text-success mb-6">Save $20 annually</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Everything in Premium
                </li>
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Priority support
                </li>
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Early access to features
                </li>
                <li className="flex items-center text-text-secondary">
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  Data export tools
                </li>
              </ul>
              <PricingButton plan="annual" className="block w-full py-3 px-6 text-center font-semibold text-white bg-navy rounded-xl hover:bg-navy-600 transition-all duration-200">
                Start Annual
              </PricingButton>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-navy">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Start Tracking
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/sign-up" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-navy bg-white rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              Sign Up Free
            </a>
            <a 
              href="/today" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              View Demo
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}