'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, MessageSquare, FileText, ArrowRight, CheckCircle, Play } from 'lucide-react';
import { setDemoMode } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  const handleTryDemo = () => {
    setDemoMode();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold">Relationship Intelligence</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Try Demo
            </button>
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          AI-Powered Relationship Intelligence
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Never Let a<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Client Slip Away
          </span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          AI that reads your conversations like you do — spotting risks, opportunities,
          and moments that matter before they slip through the cracks.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleTryDemo}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            Try Interactive Demo
          </button>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            Sign In <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Gmail Integration</h3>
            <p className="mt-2 text-gray-600">
              Analyze email conversations for sentiment, risks, and opportunities automatically.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Slack Monitoring</h3>
            <p className="mt-2 text-gray-600">
              Track client channels and DMs to catch important signals in real-time.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notion Sync</h3>
            <p className="mt-2 text-gray-600">
              Monitor project pages and comments for client feedback and updates.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900">Connect Your Tools</h3>
            <p className="mt-2 text-gray-600">
              Link Gmail, Slack, and Notion with secure OAuth — takes 2 minutes.
            </p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900">AI Analyzes Everything</h3>
            <p className="mt-2 text-gray-600">
              Claude reads your client communications and extracts actionable insights.
            </p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900">Get Daily Insights</h3>
            <p className="mt-2 text-gray-600">
              Receive your morning digest and check the dashboard for real-time updates.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Try the interactive demo to see how it works, or sign in to start getting AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleTryDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              <Play className="h-5 w-5" />
              Try Demo
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>Relationship Intelligence — AI-powered client relationship monitoring</p>
        </div>
      </footer>
    </div>
  );
}
