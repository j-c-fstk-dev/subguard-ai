import { Brain, Shield, Zap, TrendingDown, Bot, Bell } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Our AI analyzes your usage patterns to identify wasted spending and suggest optimizations.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: Zap,
    title: 'Automated Detection',
    description: 'Connect your email or bank account to automatically find all your subscriptions.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    icon: TrendingDown,
    title: 'Smart Optimization',
    description: 'Get personalized recommendations to downgrade, cancel, or bundle subscriptions.',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: Bot,
    title: 'Auto-Negotiation',
    description: 'Our AI negotiates with services to get you better deals and loyalty discounts.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: Bell,
    title: 'Proactive Alerts',
    description: 'Get notified about price increases, unused subscriptions, and better alternatives.',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    icon: Shield,
    title: '100% Secure',
    description: 'Bank-level security. We never store passwords and use read-only access.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

export default function Features() {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How SubGuard AI Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We use advanced AI to optimize every aspect of your subscription management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                <div className={`${feature.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}