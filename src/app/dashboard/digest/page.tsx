'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Mail,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Digest, DigestActionItem } from '@/types';

const typeConfig = {
  risk: {
    label: 'At Risk',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  opportunity: {
    label: 'Opportunity',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: TrendingUp,
    iconColor: 'text-blue-500',
  },
  check_in: {
    label: 'Check-in',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: Clock,
    iconColor: 'text-amber-500',
  },
};

export default function DigestPage() {
  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchDigest();
  }, []);

  const fetchDigest = async () => {
    try {
      const response = await fetch('/api/digest');
      const data = await response.json();
      if (data.digest) {
        setDigest(data.digest);
      }
    } catch (err) {
      console.error('Failed to fetch digest:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    setError(null);
    setStatus('Analyzing messages with AI...');

    try {
      // First analyze messages to generate insights
      const analyzeResponse = await fetch('/api/analyze', { method: 'POST' });
      const analyzeData = await analyzeResponse.json();
      console.log('Analysis result:', analyzeData);

      setStatus('Generating digest...');

      // Then generate the digest
      const response = await fetch('/api/digest', { method: 'POST' });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else if (data.digest) {
        setDigest(data.digest);
      }
    } catch (err) {
      setError('Failed to generate digest');
    } finally {
      setIsGenerating(false);
      setStatus(null);
    }
  };

  const handleCopyMessage = (id: string, message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 lg:w-96 bg-gray-200 rounded mb-8"></div>
          <div className="h-48 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-4xl">
        <div className="mb-6 lg:mb-8">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Daily Digest</h1>
            <p className="text-gray-500 mt-1 text-sm lg:text-base">
              Your AI-powered relationship intelligence briefing
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No digest yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Generate your first daily digest to get AI-powered insights about your client relationships.
            Make sure you have clients added and messages synced first.
          </p>
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleGenerateDigest}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {status || (isGenerating ? 'Processing...' : 'Analyze & Generate Digest')}
            </button>
            {!isGenerating && (
              <Link
                href="/dashboard/clients"
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Add Clients
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Daily Digest</h1>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">
            Your AI-powered relationship intelligence briefing
          </p>
        </div>
        <button
          onClick={handleGenerateDigest}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate New Digest'}
        </button>
      </div>

      {/* Digest Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-white/10">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Today&apos;s Digest
            </h2>
            <p className="text-gray-400 text-sm">
              {format(new Date(digest.date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span>{digest.at_risk_clients.length} at risk</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400">
            <TrendingUp className="h-4 w-4" />
            <span>{digest.opportunities.length} opportunities</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Mail className="h-4 w-4" />
            <span>{digest.action_items.length} actions</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Executive Summary</h3>
        <div className="prose prose-sm text-gray-600 whitespace-pre-line">
          {digest.summary}
        </div>
      </div>

      {/* Action Items */}
      {digest.action_items.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Action Items</h3>
          <div className="space-y-4">
            {digest.action_items.map((item: DigestActionItem, index: number) => {
              const config = typeConfig[item.type];
              const TypeIcon = config.icon;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                      <TypeIcon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {item.client_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{item.reason}</p>

                      {item.suggested_message && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              Suggested Message
                            </span>
                            <button
                              onClick={() => handleCopyMessage(item.client_id, item.suggested_message!)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {copiedId === item.client_id ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-sm text-gray-700">{item.suggested_message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4">
                        <Link
                          href={`/dashboard/clients/${item.client_id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          View Client <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
