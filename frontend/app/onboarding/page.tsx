'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, CreditCard, Upload, Check, ArrowRight } from 'lucide-react';

const steps = [
  { id: 1, name: 'Connect', description: 'Link your data sources' },
  { id: 2, name: 'Analyze', description: 'AI scans for subscriptions' },
  { id: 3, name: 'Optimize', description: 'Get personalized recommendations' },
  { id: 4, name: 'Save', description: 'Start saving money' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    {
      id: 'email',
      title: 'Connect Email',
      description: 'We analyze your billing emails',
      icon: Mail,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'bank',
      title: 'Connect Bank Account',
      description: 'Secure Open Banking connection',
      icon: CreditCard,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'manual',
      title: 'Add Manually',
      description: 'Enter subscriptions manually',
      icon: Upload,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{step.name}</div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-6">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to start?</h2>
              <p className="text-gray-600 mb-8">Choose how you want to find your subscriptions</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {options.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedOption(option.id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        selectedOption === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${option.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-gray-600">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Mail className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing your data</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Our AI is scanning for subscription patterns. This usually takes less than a minute.
              </p>
              <div className="mt-8 w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-blue-600 animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">We found your subscriptions!</h2>
              <p className="text-gray-600 mb-8">Here's what we discovered:</p>
              
              <div className="space-y-4 mb-8">
                {[
                  { name: 'Netflix', amount: 'R$ 45.90', status: 'active' },
                  { name: 'Spotify', amount: 'R$ 21.90', status: 'active' },
                  { name: 'Amazon Prime', amount: 'R$ 14.90', status: 'active' },
                  { name: 'GymPass', amount: 'R$ 99.90', status: 'unused' },
                ].map((sub, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="font-bold text-blue-600">{sub.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{sub.name}</div>
                        <div className={`text-sm ${sub.status === 'unused' ? 'text-red-600' : 'text-gray-500'}`}>
                          {sub.status === 'unused' ? 'Not used in 45+ days' : 'Active subscription'}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold">{sub.amount}/month</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">You're all set!</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                We've identified <strong>R$ 167.00</strong> in potential monthly savings. 
                Ready to start optimizing?
              </p>
              <div className="bg-green-50 rounded-xl p-6 max-w-md mx-auto">
                <div className="text-3xl font-bold text-green-600 mb-2">R$ 167.00/month</div>
                <div className="text-gray-600">Potential savings</div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            <button
              onClick={handleContinue}
              disabled={currentStep === 1 && !selectedOption}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {currentStep === 4 ? 'Go to Dashboard' : 'Continue'}
              {currentStep < 4 && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}