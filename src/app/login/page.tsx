'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Lock, Ticket, Play, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'invite'>('password');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginWithInviteCode, enterDemoMode } = useAuth();
  const router = useRouter();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (login(password)) {
      router.push('/dashboard');
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (loginWithInviteCode(inviteCode)) {
      router.push('/dashboard');
    } else {
      setError('Invalid invite code');
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    enterDemoMode();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-fit">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Access Dashboard</h1>
            <p className="text-gray-500 mt-2">Enter your password or try the demo</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setMode('password'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'password'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Lock className="h-4 w-4" />
                Password
              </button>
              <button
                onClick={() => { setMode('invite'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'invite'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Ticket className="h-4 w-4" />
                Invite Code
              </button>
            </div>

            {/* Password Form */}
            {mode === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Invite Code Form */}
            {mode === 'invite' && (
              <form onSubmit={handleInviteSubmit}>
                <div className="mb-4">
                  <label htmlFor="invite" className="block text-sm font-medium text-gray-700 mb-1">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    id="invite"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    placeholder="Enter invite code"
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Enter with Code'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Demo Button */}
            <button
              onClick={handleDemoMode}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 rounded-lg font-medium hover:from-blue-100 hover:to-purple-100 transition-colors"
            >
              <Play className="h-4 w-4" />
              Try Interactive Demo
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Explore with sample data — no login required
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
