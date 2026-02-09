'use client';
import { useState } from 'react';
import { X, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';

interface ConnectEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConnectEmailModal({ isOpen, onClose, onSuccess }: ConnectEmailModalProps) {
  const [step, setStep] = useState<'select' | 'connecting' | 'success'>('select');
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  if (!isOpen) return null;

  const providers = [
    { id: 'gmail', name: 'Gmail', icon: '📧', color: 'bg-red-50 border-red-200' },
    { id: 'outlook', name: 'Outlook', icon: '📨', color: 'bg-blue-50 border-blue-200' },
    { id: 'yahoo', name: 'Yahoo', icon: '📬', color: 'bg-purple-50 border-purple-200' },
  ];

  const handleConnect = async (providerId: string) => {
    setSelectedProvider(providerId);
    setStep('connecting');

    // MOCK: Simula conexão (2s)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setStep('success');
    
    // Fecha após 1.5s
    setTimeout(() => {
      onSuccess();
      onClose();
      resetModal();
    }, 1500);
  };

  const resetModal = () => {
    setStep('select');
    setSelectedProvider('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative">
        <button
          onClick={() => { onClose(); resetModal(); }}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* STEP 1: SELECT PROVIDER */}
          {step === 'select' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">Connect Email</h2>
                  <p className="text-sm text-neutral-600">Choose your email provider</p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Demo Mode</p>
                  <p>Email connection is simulated. In production, this would use OAuth 2.0.</p>
                </div>
              </div>

              <div className="space-y-3">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleConnect(provider.id)}
                    className={`w-full p-4 border-2 ${provider.color} rounded-lg hover:shadow-md transition flex items-center gap-4`}
                  >
                    <span className="text-3xl">{provider.icon}</span>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-neutral-900">{provider.name}</p>
                      <p className="text-xs text-neutral-600">Connect your {provider.name} account</p>
                    </div>
                    <Mail className="w-5 h-5 text-neutral-400" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STEP 2: CONNECTING */}
          {step === 'connecting' && (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Connecting to {providers.find(p => p.id === selectedProvider)?.name}...
              </h3>
              <p className="text-neutral-600">Please wait while we securely connect your account</p>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                Successfully Connected!
              </h3>
              <p className="text-neutral-600">
                We'll start scanning your emails for subscriptions
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
