'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  Plus,
} from 'lucide-react';
import ClientCard from '@/components/ClientCard';
import InsightCard from '@/components/InsightCard';
import type { Client, Insight } from '@/types';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<(Insight & { clientName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clientsRes, insightsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/insights'),
      ]);

      const clientsData = await clientsRes.json();
      const insightsData = await insightsRes.json();

      setClients(clientsData.clients || []);
      setInsights(insightsData.insights || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const stats = {
    totalClients: clients.length,
    atRisk: clients.filter((c) => c.status === 'at_risk').length,
    opportunities: clients.filter((c) => c.status === 'opportunity').length,
    avgHealth: clients.length > 0
      ? Math.round(clients.reduce((sum, c) => sum + c.health_score, 0) / clients.length)
      : 0,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          Refresh
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
              <p className="text-2xl font-bold text-gray-900">{stats.avgHealth || 0}%</p>
              <p className="text-sm text-gray-500">Avg Health</p>
            </div>
          </div>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Relationship Intelligence!</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first client and connecting Slack.</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard/clients"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
            <Link
              href="/dashboard/integrations"
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Connect Slack
            </Link>
          </div>
        </div>
      ) : (
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
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    clientName={insight.clientName}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <p className="text-gray-500">No insights yet. Connect Slack and sync messages to generate insights.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
