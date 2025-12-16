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
import OnboardingFlow from '@/components/OnboardingFlow';
import type { Client, Insight } from '@/types';

const ONBOARDING_COMPLETE_KEY = 'ri_onboarding_complete';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<(Insight & { clientName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Check if onboarding should be shown after data loads
  useEffect(() => {
    if (!loading && clients.length === 0) {
      const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
    }
  }, [loading, clients.length]);

  const fetchData = async () => {
    try {
      setError(null);
      const [clientsRes, insightsRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/insights'),
      ]);

      if (!clientsRes.ok || !insightsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const clientsData = await clientsRes.json();
      const insightsData = await insightsRes.json();

      setClients(clientsData.clients || []);
      setInsights(insightsData.insights || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (data: {
    businessType: string;
    clientCount: string;
    primaryGoal: string;
    firstClient: { name: string; company: string; email: string };
  }) => {
    // Save onboarding preferences (could be saved to user settings)
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    localStorage.setItem('ri_user_preferences', JSON.stringify({
      businessType: data.businessType,
      clientCount: data.clientCount,
      primaryGoal: data.primaryGoal,
    }));

    // Create the first client
    if (data.firstClient.name) {
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.firstClient.name,
            company: data.firstClient.company,
            email: data.firstClient.email,
          }),
        });

        if (response.ok) {
          await fetchData(); // Refresh to show new client
        }
      } catch (err) {
        console.error('Failed to create client:', err);
      }
    }

    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    setShowOnboarding(false);
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

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 mx-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm lg:text-base">Your client relationship overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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
