'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, Mail, Bell, Lock, Save, ArrowLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import { showSuccess, showError } from '@/lib/toast';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    fullName: 'Demo User',
    email: 'dev@subguard.ai',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    language: 'pt-BR',
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    priceAlerts: true,
    weeklySummary: true,
    optimizationSuggestions: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'emails', label: 'Connected Emails', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  const handleSaveProfile = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showSuccess('Profile updated successfully!');
    setLoading(false);
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showSuccess('Notification preferences saved!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header com botão Back */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        <h1 className="text-3xl font-bold text-neutral-900 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-500"
                />
                <p className="text-xs text-neutral-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={profile.currency}
                    onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Language
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pt-BR">Português (BR)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Card>
        )}

        {/* Connected Emails Tab */}
        {activeTab === 'emails' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Connected Emails</h2>
            <p className="text-neutral-600 mb-4">No emails connected yet. Connect an email to automatically detect subscriptions.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Connect Email
            </button>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Receive notifications about this topic
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [key]: !value })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <button
                onClick={handleSaveNotifications}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-6"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </Card>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Privacy & Security</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-neutral-900 mb-2">Download Your Data</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  Export all your subscription data in JSON format
                </p>
                <button className="border border-neutral-300 text-neutral-700 px-6 py-2 rounded-lg hover:bg-neutral-50">
                  Download Data
                </button>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="font-medium text-red-600 mb-2">Delete Account</h3>
                <p className="text-sm text-neutral-600 mb-3">
                  Permanently delete your account and all associated data
                </p>
                <button className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50">
                  Delete Account
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 p-6">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
