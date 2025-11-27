'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  FileText,
  Send,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import InsightCard from '@/components/InsightCard';
import type { Client, Communication, Insight } from '@/types';

// Demo data
const demoClient: Client = {
  id: '1',
  name: 'Dear Health',
  company: 'Dear Health Inc.',
  email: 'team@dearhealth.com',
  status: 'healthy',
  health_score: 85,
  last_contact: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  updated_at: new Date().toISOString(),
};

const demoCommunications: Communication[] = [
  {
    id: '1',
    client_id: '1',
    source: 'gmail',
    source_id: 'msg1',
    subject: 'Re: Project Update',
    content: 'Thanks for the update! Really happy with how this is progressing. The new features look great and the team is excited to start testing next week.',
    sender: 'team@dearhealth.com',
    recipient: 'you@example.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    analyzed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    client_id: '1',
    source: 'slack',
    source_id: 'msg2',
    content: 'Quick question - can we schedule a call this week to discuss the Q2 roadmap?',
    sender: 'Sarah @ Dear Health',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    analyzed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    client_id: '1',
    source: 'gmail',
    source_id: 'msg3',
    subject: 'Feedback on latest delivery',
    content: 'Just wanted to share some feedback from our team. Everyone is impressed with the quality of the work. This is exactly what we were hoping for when we started this project.',
    sender: 'team@dearhealth.com',
    recipient: 'you@example.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    analyzed: true,
    created_at: new Date().toISOString(),
  },
];

const demoInsights: Insight[] = [
  {
    id: '1',
    client_id: '1',
    type: 'sentiment',
    severity: 'low',
    title: 'Consistently positive sentiment',
    description: 'Client has expressed satisfaction in 4 out of 5 recent communications. Relationship appears strong.',
    evidence: ['Really happy with how this is progressing', 'This is exactly what we were hoping for'],
    suggested_action: 'Request testimonial',
    is_resolved: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    client_id: '1',
    type: 'action_needed',
    severity: 'medium',
    title: 'Meeting request pending',
    description: 'Client requested a call to discuss Q2 roadmap 2 days ago. No response sent yet.',
    evidence: ['Can we schedule a call this week to discuss the Q2 roadmap?'],
    suggested_action: 'Schedule call',
    is_resolved: false,
    created_at: new Date().toISOString(),
  },
];

const sourceIcons = {
  gmail: Mail,
  slack: MessageSquare,
  notion: FileText,
};

const sourceColors = {
  gmail: 'bg-red-100 text-red-600',
  slack: 'bg-purple-100 text-purple-600',
  notion: 'bg-gray-100 text-gray-600',
};

const statusConfig = {
  healthy: { label: 'Healthy', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  at_risk: { label: 'At Risk', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  opportunity: { label: 'Opportunity', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
  neutral: { label: 'Neutral', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;

  // In real app, fetch client data based on clientId
  const [client] = useState<Client>(demoClient);
  const [communications] = useState<Communication[]>(demoCommunications);
  const [insights] = useState<Insight[]>(demoInsights);
  const [draftMessage, setDraftMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const config = statusConfig[client.status];
  const StatusIcon = config.icon;

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    // TODO: Call Claude API to generate message
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setDraftMessage(
      `Hi Sarah,\n\nThanks for reaching out! I'd love to discuss the Q2 roadmap with you. I have some availability Thursday afternoon or Friday morning - would either of those work?\n\nLooking forward to connecting.\n\nBest`
    );
    setIsGenerating(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {client.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-500">{client.company}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </span>
                <span className="text-sm text-gray-500">
                  Client since {format(new Date(client.created_at), 'MMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{client.health_score}%</div>
            <div className="text-sm text-gray-500">Health Score</div>
            <div className="mt-2 w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  client.health_score >= 70
                    ? 'bg-green-500'
                    : client.health_score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${client.health_score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Communications */}
        <div className="col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Communications</h2>
          <div className="space-y-4">
            {communications.map((comm) => {
              const SourceIcon = sourceIcons[comm.source];
              return (
                <div key={comm.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${sourceColors[comm.source]}`}>
                      <SourceIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{comm.sender}</span>
                          {comm.subject && (
                            <span className="text-gray-500 ml-2">• {comm.subject}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comm.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{comm.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Quick Reply</h3>
              <button
                onClick={handleGenerateMessage}
                disabled={isGenerating}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Generate with AI
              </button>
            </div>
            <textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              placeholder="Type a message or generate one with AI..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-3">
              <button
                disabled={!draftMessage.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>

        {/* Insights Sidebar */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {/* Client Info */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Client Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900">{client.email || 'Not set'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Contact</dt>
                <dd className="text-gray-900">
                  {formatDistanceToNow(new Date(client.last_contact), { addSuffix: true })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Messages</dt>
                <dd className="text-gray-900">{communications.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
