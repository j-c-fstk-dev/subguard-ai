'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    if (email) {
      // In production, this would trigger email signup
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Subscription Optimization
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Stop wasting money on
            <span className="text-blue-600 block">subscriptions you don't use</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            SubGuard AI automatically finds, analyzes, and optimizes your subscriptions.
            The average user saves <span className="font-bold text-green-600">R$ 1,200/year</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-6 py-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
          
          <p className="text-gray-500 text-sm mt-4">
            No credit card required • 30-second setup
          </p>
        </div>
      </div>
    </div>
  );
}