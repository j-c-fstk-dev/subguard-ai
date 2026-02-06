'use client';

import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Hero() {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    if (email) {
      window.location.href = '/signup?email=' + encodeURIComponent(email);
    } else {
      window.location.href = '/signup';
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative container-custom section-hero">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 border border-primary-200 text-primary-700 text-sm font-semibold mb-8 animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Subscription Optimization
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-900 mb-6 animate-slide-up leading-tight">
            Stop wasting money on
            <span className="block mt-2 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              subscriptions you don't use
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-neutral-600 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            SubGuard AI automatically finds, analyzes, and optimizes your subscriptions.
            The average user saves{' '}
            <span className="font-bold text-success-600 bg-success-50 px-2 py-1 rounded">
              R$ 1,200/year
            </span>
          </p>
          
          {/* CTA Form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input flex-grow px-6 py-4 text-base shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGetStarted()}
            />
            
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="shadow-primary group"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>30-second setup</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-12 border-t border-neutral-200 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 mb-1">10,000+</div>
                <div className="text-neutral-600 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 mb-1">R$ 2M+</div>
                <div className="text-neutral-600 text-sm">Total Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-neutral-900 mb-1">4.9/5</div>
                <div className="text-neutral-600 text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
