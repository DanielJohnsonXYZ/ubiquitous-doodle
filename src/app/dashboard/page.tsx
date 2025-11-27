'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
} from 'lucide-react';
import ClientCard from '@/components/ClientCard';
import InsightCard from '@/components/InsightCard';
import type { Client, Insight } from '@/types';

// Demo data - will be replaced with real data from Supabase
const demoClients: Client[] = [
  {
    id: '1',
    name: 'Dear Health',
    company: 'Dear Health Inc.',
    email: 'team@dearhealth.com',
    status: 'healthy',
    health_score: 85,
    last_contact: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Acme Corp',
    company: 'Acme Corporation',
    email: 'contact@acme.com',
    status: 'at_risk',
    health_score: 42,
    last_contact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'TechStart',
    company: 'TechStart Inc.',
    email: 'hello@techstart.io',
    status: 'opportunity',
    health_score: 78,
    last_contact: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoInsights: (Insight & { clientName: string })[] = [
  {
    id: '1',
    client_id: '2',
    clientName: 'Acme Corp',
    type: 'risk',
    severity: 'high',
    title: 'Response time has doubled',
    description: 'Client responses have slowed from 2 hours to 4+ hours over the past two weeks. Last message showed frustration about timeline delays.',
    evidence: [
      "I'm a bit concerned about where we're at with the timeline...",
      "Can we get an update on when this will be resolved?",
    ],
    suggested_action: 'Send check-in message',
    is_resolved: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    client_id: '3',
    clientName: 'TechStart',
    type: 'opportunity',
    severity: 'medium',
    title: 'Expansion signal detected',
    description: 'Client mentioned expanding to 3 new markets and asked about "scaling our current setup" twice this week.',
    evidence: [
      "We're looking at expanding into APAC next quarter",
      "What would it take to scale what we have now?",
    ],
    suggested_action: 'Draft expansion proposal',
    is_resolved: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    client_id: '1',
    clientName: 'Dear Health',
    type: 'sentiment',
    severity: 'low',
    title: 'Positive feedback received',
    description: 'Client expressed satisfaction with recent deliverables and mentioned the project is "exceeding expectations".',
    evidence: [
      "Really happy with how this turned out",
      "This is exactly what we were hoping for",
    ],
    suggested_action: 'Request testimonial',
    is_resolved: false,
    created_at: new Date().toISOString(),
  },
];

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [insights, setInsights] = useState<(Insight & { clientName: string })[]>(demoInsights);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = {
    totalClients: clients.length,
    atRisk: clients.filter((c) => c.status === 'at_risk').length,
    opportunities: clients.filter((c) => c.status === 'opportunity').length,
    avgHealth: Math.round(clients.reduce((sum, c) => sum + c.health_score, 0) / clients.length),
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // TODO: Fetch real data from API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your client relationship overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Sync Now
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              <p className="text-sm text-gray-500">Total Clients</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
              <p className="text-sm text-gray-500">At Risk</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.opportunities}</p>
              <p className="text-sm text-gray-500">Opportunities</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgHealth}%</p>
              <p className="text-sm text-gray-500">Avg Health</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Clients */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clients</h2>
          <div className="space-y-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                latestInsight={
                  insights.find((i) => i.client_id === client.id)?.description
                }
              />
            ))}
          </div>
        </div>

        {/* Recent Insights */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h2>
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                clientName={insight.clientName}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
