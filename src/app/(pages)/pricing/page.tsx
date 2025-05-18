import React from 'react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '£0',
    period: 'per month',
    features: [
      'Basic access',
      'Community support',
      'Limited features',
    ],
    cta: 'Get Started',
    ctaLink: '/auth/register',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '£9.99',
    period: 'per month',
    features: [
      'All Free features',
      'Priority support',
      'Advanced analytics',
      'Access to premium content',
    ],
    cta: 'Upgrade to Premium',
    ctaLink: '/auth/register?plan=premium',
    highlight: true,
  },
  {
    name: 'VIP',
    price: '£29.99',
    period: 'per month',
    features: [
      'All Premium features',
      '1-on-1 onboarding',
      'Exclusive VIP events',
      'Direct line to support',
      'Early access to new features',
    ],
    cta: 'Become VIP',
    ctaLink: '/auth/register?plan=vip',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="w-full bg-gray-950 text-gray-100 flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-6 text-[#ff3c00] drop-shadow-lg">Choose Your Plan</h1>
      <p className="text-lg text-gray-300 mb-12 text-center max-w-2xl">
        Find the plan that fits your needs. Upgrade anytime for more features and support.
      </p>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-2xl border shadow-xl p-8 bg-gray-900/80 border-gray-800 relative transition-transform hover:scale-105 ${
              plan.highlight ? 'border-[#ff3c00] shadow-[#ff3c00]/20 ring-2 ring-[#ff3c00]' : ''
            }`}
          >
            {plan.highlight && (
              <span className="absolute top-4 right-4 bg-[#ff3c00] text-white text-xs font-bold px-3 py-1 rounded-full shadow">Most Popular</span>
            )}
            <h2 className="text-2xl font-bold mb-2 text-white text-center">{plan.name}</h2>
            <div className="text-4xl font-extrabold text-[#ff3c00] text-center mb-1">{plan.price}</div>
            <div className="text-sm text-gray-400 text-center mb-6">{plan.period}</div>
            <ul className="flex-1 mb-8 space-y-3">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-200">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#ff3c00]" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.ctaLink}
              className={`w-full py-3 rounded-xl text-lg font-bold text-center transition focus:outline-none focus:ring-2 focus:ring-[#ff3c00] ${
                plan.highlight
                  ? 'bg-[#ff3c00] text-white hover:bg-[#ff6a00] shadow-lg shadow-[#ff3c00]/20'
                  : 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
