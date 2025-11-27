'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Mail,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { DigestActionItem } from '@/types';

// Demo data
const demoDigest = {
  id: '1',
  date: new Date().toISOString().split('T')[0],
  summary: `Good morning! Here's your relationship intelligence briefing for today.

**Immediate Attention Needed:** Acme Corp's engagement has dropped significantly over the past two weeks. Their response times have doubled and the last message showed frustration about timeline delays. I recommend reaching out today with a proactive update.

**Opportunity Alert:** TechStart mentioned expanding to 3 new markets and asked about scaling their current setup twice this week. This could be a significant expansion opportunity worth pursuing.

**Overall Health:** Your client portfolio is in good shape with an average health score of 68%. Dear Health continues to show strong engagement with consistently positive sentiment.`,
  at_risk_clients: ['2'],
  opportunities: ['3'],
  action_items: [
    {
      client_id: '2',
      client_name: 'Acme Corp',
      type: 'risk' as const,
      reason: 'Response time doubled in past 2 weeks. Last message showed frustration about timeline delays.',
      suggested_message: "Hi team, I wanted to reach out proactively about the project timeline. I understand there have been some delays and I want to make sure we're aligned on next steps. Do you have 15 minutes this week to discuss?",
    },
    {
      client_id: '3',
      client_name: 'TechStart',
      type: 'opportunity' as const,
      reason: 'Mentioned expanding to 3 new markets and asked about scaling current setup.',
      suggested_message: "Hi! I noticed you mentioned expanding to new markets - that's exciting! I'd love to chat about how we can support your growth. Would you be open to a quick call to explore some options?",
    },
    {
      client_id: '1',
      client_name: 'Dear Health',
      type: 'check_in' as const,
      reason: 'Strong engagement - good opportunity to request testimonial or referral.',
      suggested_message: "Hey! I've really enjoyed working together on this project. Your feedback has been great to hear. Would you be open to sharing a brief testimonial about your experience?",
    },
  ] as DigestActionItem[],
  created_at: new Date().toISOString(),
};

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
  const [digest] = useState(demoDigest);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    // TODO: Call /api/digest endpoint
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleCopyMessage = (id: string, message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Digest</h1>
          <p className="text-gray-500 mt-1">
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
              Today's Digest
            </h2>
            <p className="text-gray-400 text-sm">
              {format(new Date(digest.date), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
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
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Action Items</h3>
        <div className="space-y-4">
          {digest.action_items.map((item, index) => {
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
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        View Client <ChevronRight className="h-4 w-4" />
                      </button>
                      <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Email Delivery</h3>
        <p className="text-sm text-blue-800 mb-4">
          Get this digest delivered to your inbox every morning at 8:00 AM.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 px-4 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}
