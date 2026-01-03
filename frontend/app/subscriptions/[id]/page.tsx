'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionDetailPage() {
  const params = useParams();
  const id = params.id;

  // Mock data - em produção viria da API
  const subscription = {
    id: id,
    name: 'Netflix',
    plan: 'Premium',
    price: 45.90,
    billingCycle: 'monthly',
    nextBilling: '2024-02-15',
    status: 'active',
    usage: {
      screens: 1.2,
      hoursPerMonth: 25,
      lastUsed: '2024-01-10',
      concurrentUsers: 1
    },
    features: ['4 screens', 'Ultra HD', 'Download videos']
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/subscriptions" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Subscriptions
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{subscription.name}</h1>
                <div className="flex items-center flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {subscription.plan}
                  </span>
                  <span className="text-2xl font-bold">R$ {subscription.price.toFixed(2)}</span>
                  <span className="text-blue-100">/{subscription.billingCycle}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-4 py-2 bg-white/20 rounded-lg inline-block">
                  {subscription.status}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Next Billing Date</span>
                    <span className="font-semibold flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {subscription.nextBilling}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-semibold capitalize">{subscription.billingCycle}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="text-gray-600">Customer Since</span>
                    <span className="font-semibold">January 2020</span>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Usage Analytics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingDown className="w-5 h-5 text-gray-400 mr-3" />
                      <span>Average Screens Used</span>
                    </div>
                    <span className="font-semibold">{subscription.usage.screens} / 4</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                      <span>Last Used</span>
                    </div>
                    <span className="font-semibold">{subscription.usage.lastUsed}</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Recommendations</h2>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">Plan Mismatch Detected</h3>
                      <p className="text-yellow-700">
                        You're paying for 4 screens but only use {subscription.usage.screens} on average.
                        Switch to Basic plan and save <strong>R$ 22.00/month</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">Recommended Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                      Downgrade to Basic Plan
                    </button>
                    <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition font-medium">
                      Negotiate Better Price
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium">
                      Cancel Subscription
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Potential annual savings: <span className="font-bold text-green-600">R$ 264.00</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}