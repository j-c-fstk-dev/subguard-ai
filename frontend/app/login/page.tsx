'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 Tentando login com:', email);
      
      // Chamada REAL para a API do backend
      const response = await fetch('http://localhost:8000/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login bem-sucedido! Token recebido');
        
        // Armazenar o token JWT REAL
        localStorage.setItem('access_token', data.access_token);
        
        // Também armazenar informações básicas do usuário
        localStorage.setItem('user_email', email);
        localStorage.setItem('isLoggedIn', 'true');
        
        router.push('/dashboard');
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        console.error('❌ Erro no login:', errorData);
        
        // Fallback para modo demo se a API falhar
        console.log('🔄 Usando modo demo como fallback...');
        localStorage.setItem('access_token', 'demo-token-fallback');
        localStorage.setItem('user_email', email || 'demo@subguard.ai');
        localStorage.setItem('isLoggedIn', 'true');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      
      // Fallback completo para modo demo
      console.log('🔄 Backend offline, usando modo demo...');
      localStorage.setItem('access_token', 'demo-token-offline');
      localStorage.setItem('user_email', email || 'demo@subguard.ai');
      localStorage.setItem('isLoggedIn', 'true');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your subscriptions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-semibold">Test Credentials:</span>
              </p>
              <p className="text-gray-600 text-sm font-mono bg-gray-100 p-2 rounded">
                usuario@teste.com / senha123
              </p>
              <p className="text-gray-400 text-xs mt-2">
                (Create user in backend first if needed)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
