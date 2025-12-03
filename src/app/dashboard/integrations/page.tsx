'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MessageSquare, FileText, CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface IntegrationData {
  id: string;
  type: string;
  connected_at: string;
  last_sync: string | null;
  metadata: Record<string, string>;
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: typeof Mail;
  color: string;
  bgColor: string;
}

const integrationConfigs: IntegrationConfig[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail to analyze email conversations with clients',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Monitor client channels and DMs for sentiment and signals',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Track client project pages and comments for updates',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
];

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<IntegrationsLoading />}>
      <IntegrationsContent />
    </Suspense>
  );
}

function IntegrationsLoading() {
  return (
    <div className="p-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationsContent() {
  const searchParams = useSearchParams();
  // Support multiple accounts per type
  const [integrations, setIntegrations] = useState<Record<string, IntegrationData[]>>({
    gmail: [],
    slack: [],
    notion: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch integration status from database
  useEffect(() => {
    fetchIntegrations();
  }, []);

  // Handle URL params from OAuth callback
  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success) {
      setMessage({ type: 'success', text: `${success.charAt(0).toUpperCase() + success.slice(1)} connected successfully!` });
      // Clear URL params first
      window.history.replaceState({}, '', '/dashboard/integrations');
      // Fetch immediately and retry after delay to handle race conditions
      fetchIntegrations();
      const timer = setTimeout(() => fetchIntegrations(), 1000);
      return () => clearTimeout(timer);
    } else if (errorParam) {
      setMessage({ type: 'error', text: `Connection failed: ${errorParam}` });
      window.history.replaceState({}, '', '/dashboard/integrations');
    }
  }, [searchParams]);

  const fetchIntegrations = async () => {
    try {
      setError(null);
      const response = await fetch('/api/integrations');
      if (!response.ok) {
        throw new Error('Failed to fetch integrations');
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.integrations) {
        // Group integrations by type (supports multiple accounts)
        const integrationsMap: Record<string, IntegrationData[]> = {
          gmail: [],
          slack: [],
          notion: [],
        };

        for (const integration of data.integrations) {
          if (integrationsMap[integration.type]) {
            integrationsMap[integration.type].push(integration);
          }
        }

        setIntegrations(integrationsMap);
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (integrationId: string) => {
    const oauthUrls: Record<string, string> = {
      gmail: '/api/integrations/gmail/auth',
      slack: '/api/integrations/slack/auth',
      notion: '/api/integrations/notion/auth',
    };

    window.location.href = oauthUrls[integrationId] || '#';
  };

  const handleDisconnect = async (integrationId: string, accountId?: string) => {
    try {
      const url = accountId
        ? `/api/integrations/${integrationId}?id=${accountId}`
        : `/api/integrations/${integrationId}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh integrations after disconnect
        fetchIntegrations();
        setMessage({ type: 'success', text: `Account disconnected` });
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
      setMessage({ type: 'error', text: 'Failed to disconnect' });
    }
  };

  const handleSync = async (integrationId: string, deep = false) => {
    setSyncing(integrationId);
    setMessage(null);

    try {
      const url = deep
        ? `/api/integrations/${integrationId}/sync?deep=true`
        : `/api/integrations/${integrationId}/sync`;

      const response = await fetch(url, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        const stored = data.stored ?? data.synced ?? 0;
        const found = data.found ?? stored;
        const syncType = deep ? 'Deep synced' : 'Synced';
        setMessage({ type: 'success', text: `${syncType} ${stored} of ${found} messages from ${integrationId}` });
        fetchIntegrations(); // Refresh to get updated last_sync
      } else {
        setMessage({ type: 'error', text: data.error || 'Sync failed' });
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setMessage({ type: 'error', text: 'Sync failed' });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-500 mt-1">
            Connect your communication tools to start monitoring client relationships
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Integrations</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchIntegrations();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">
          Connect your communication tools to start monitoring client relationships
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        {integrationConfigs.map((config) => {
          const Icon = config.icon;
          const accounts = integrations[config.id] || [];
          const hasAccounts = accounts.length > 0;
          const isSyncing = syncing === config.id;
          const supportsMultiple = config.id === 'gmail'; // Only Gmail supports multiple accounts for now

          return (
            <div
              key={config.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${config.bgColor}`}>
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {config.name}
                      </h3>
                      {hasAccounts && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          {accounts.length} Connected
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mt-1">{config.description}</p>
                  </div>
                </div>

                {/* Add account button */}
                <button
                  onClick={() => handleConnect(config.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                >
                  {hasAccounts && supportsMultiple ? 'Add Account' : 'Connect'}
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>

              {/* Connected accounts list */}
              {hasAccounts && (
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {account.metadata?.email || account.metadata?.name || 'Connected Account'}
                        </p>
                        {account.last_sync ? (
                          <p className="text-xs text-gray-500">
                            Last synced: {new Date(account.last_sync).toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">
                            Connected {new Date(account.connected_at).toLocaleString()} - Not synced yet
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSync(config.id)}
                          disabled={isSyncing}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Syncing...' : 'Sync'}
                        </button>
                        <button
                          onClick={() => handleSync(config.id, true)}
                          disabled={isSyncing}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                        >
                          Deep
                        </button>
                        <button
                          onClick={() => handleDisconnect(config.id, account.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Setup Guide */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Setup Guide</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>1. Connect Slack:</strong> Add the RelIntel app to your workspace and authorize access to read messages.
          </p>
          <p>
            <strong>2. Add your clients:</strong> Go to Clients page and add your client names so messages can be matched.
          </p>
          <p>
            <strong>3. Sync messages:</strong> Click "Sync Now" to pull in recent messages and analyze them.
          </p>
        </div>
      </div>
    </div>
  );
}
