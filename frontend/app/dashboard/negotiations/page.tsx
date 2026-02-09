'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Clock, Loader2, Send } from 'lucide-react';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Message {
  role: 'user' | 'provider';
  content: string;
  timestamp: string;
}

interface FinalOffer {
  plan: string;
  price: number;
  savings: number;
  terms: string;
}

interface Negotiation {
  id: string;
  subscription_id: string;
  provider_name: string;
  current_plan: string;
  proposed_savings: number;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  messages: Message[];
  offer_accepted: boolean;
  final_offer?: FinalOffer;
  notes?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export default function NegotiationsPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    loadNegotiations();
  }, []);

  async function loadNegotiations() {
    try {
      setLoading(true);
      const response = await api.get('/api/negotiations/');
      setNegotiations(response.data);
    } catch (error) {
      console.error('Failed to load negotiations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(negotiationId: string) {
    if (!messageText.trim()) return;

    try {
      setSendingMessage(true);
      const response = await api.post(
        `/api/negotiations/${negotiationId}/message`,
        null,
        {
          params: { message: messageText }
        }
      );

      // Atualizar negociação local
      setNegotiations(prev =>
        prev.map(n =>
          n.id === negotiationId
            ? { ...n, messages: response.data.messages }
            : n
        )
      );

      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  }

  async function acceptOffer(negotiationId: string) {
    try {
      await api.post(`/api/negotiations/${negotiationId}/accept`);
      await loadNegotiations();
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  }

  async function rejectNegotiation(negotiationId: string) {
    try {
      await api.post(`/api/negotiations/${negotiationId}/reject`);
      await loadNegotiations();
    } catch (error) {
      console.error('Failed to reject negotiation:', error);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'accepted':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 border-blue-200';
      case 'accepted':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Negotiations</h1>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Negotiations</h1>
        <p className="text-gray-600 mt-2">
          Chat with providers to negotiate better rates
        </p>
      </div>

      {negotiations.length === 0 ? (
        <Card className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No active negotiations</p>
          <p className="text-gray-400 text-sm mt-1">
            Apply recommendations to start negotiating
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {negotiations.map((negotiation) => (
            <div
              key={negotiation.id}
              className={`border-2 rounded-lg transition-all duration-300 ${getStatusColor(
                negotiation.status
              )}`}
            >
              {/* Card Header - Collapsed View */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === negotiation.id ? null : negotiation.id
                  )
                }
                className="w-full p-4 text-left hover:opacity-75 transition-opacity"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg">
                      {getStatusIcon(negotiation.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {negotiation.provider_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Potential savings: R${negotiation.proposed_savings.toFixed(2)}/month
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                      {negotiation.messages.length} messages
                    </span>
                  </div>
                </div>
              </button>

              {/* Expanded Chat View */}
              {expandedId === negotiation.id && (
                <div className="border-t-2 border-current p-4 space-y-4 bg-white/50">
                  {/* Chat Messages */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {negotiation.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.role === 'user'
                                ? 'text-blue-100'
                                : 'text-gray-600'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Offer Display */}
                  {negotiation.final_offer && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-semibold text-green-900 text-sm mb-2">
                        💰 Final Offer
                      </p>
                      <p className="text-sm text-green-800">
                        Plan: {negotiation.final_offer.plan}
                      </p>
                      <p className="text-sm text-green-800">
                        Price: R${negotiation.final_offer.price.toFixed(2)}/month
                      </p>
                      <p className="text-sm text-green-800">
                        Savings: R${negotiation.final_offer.savings.toFixed(2)}/month
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {negotiation.final_offer.terms}
                      </p>
                    </div>
                  )}

                  {/* Message Input */}
                  {negotiation.status === 'active' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !sendingMessage) {
                            sendMessage(negotiation.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => sendMessage(negotiation.id)}
                        disabled={sendingMessage || !messageText.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {negotiation.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => acceptOffer(negotiation.id)}
                        variant="success"
                        size="sm"
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept Offer
                      </Button>
                      <Button
                        onClick={() => rejectNegotiation(negotiation.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {negotiation.status === 'accepted' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-green-900 font-semibold text-sm">
                        ✅ Negotiation Accepted
                      </p>
                    </div>
                  )}

                  {negotiation.status === 'rejected' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                      <p className="text-red-900 font-semibold text-sm">
                        ❌ Negotiation Rejected
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}