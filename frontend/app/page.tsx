import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle, Brain, Zap, TrendingDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              SubGuard AI
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button size="sm">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
        </div>

        <main className="relative container-custom py-20 lg:py-32 text-center">
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
          <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
            AI-powered subscription optimization. The average user saves{' '}
            <span className="font-bold text-success-600 bg-success-50 px-2 py-1 rounded">
              R$ 1,200/year
            </span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Link href="/dashboard">
              <Button size="lg" className="shadow-primary group">
                Try Demo Dashboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Sign Up Free
              </Button>
            </Link>
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
        </main>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Three simple steps to start saving money
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Connect',
                description: 'Link your email or upload bills',
                icon: '📧',
                gradient: 'from-blue-500 to-blue-600',
                bgGradient: 'from-blue-50 to-blue-100'
              },
              {
                title: 'Analyze',
                description: 'AI finds wasted spending',
                icon: '🤖',
                gradient: 'from-purple-500 to-purple-600',
                bgGradient: 'from-purple-50 to-purple-100'
              },
              {
                title: 'Save',
                description: 'Automatically optimize subscriptions',
                icon: '💰',
                gradient: 'from-green-500 to-green-600',
                bgGradient: 'from-green-50 to-green-100'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group text-center p-8 rounded-2xl border border-neutral-200 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-neutral-50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`text-6xl mb-6 inline-block p-4 rounded-2xl bg-gradient-to-br ${feature.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-purple-700 text-white py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Saving Today
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already saving money
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-neutral-100">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
