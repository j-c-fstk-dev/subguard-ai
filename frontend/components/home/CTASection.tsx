'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const benefits = [
  'Average savings: R$ 1,200/year',
  '30-second setup',
  'No credit card required',
  'Cancel anytime',
  'Bank-level security',
  'AI negotiation included'
];

export default function CTASection() {
  const [email, setEmail] = useState('');

  const handleStartFreeTrial = () => {
    if (email) {
      // In production, save email and redirect
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/signup';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Saving Today
          </h2>
          
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already saving with SubGuard AI
          </p>
          
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  What You Get
                </h3>
                
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Start Free Trial
                </h3>
                
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  
                  <button
                    onClick={handleStartFreeTrial}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-500 text-sm mt-4 text-center">
                  No credit card required • 14-day free trial
                </p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-bold text-gray-900">4.9/5</div>
                  <div className="text-gray-600">Average rating</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10,000+</div>
                  <div className="text-gray-600">Active users</div>
                </div>
                
                <div className="text-center md:text-right">
                  <div className="text-3xl font-bold text-gray-900">R$ 2M+</div>
                  <div className="text-gray-600">Total savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}