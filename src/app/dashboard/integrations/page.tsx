'use client';

import { useState } from 'react';
import { Mail, MessageSquare, FileText, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Mail;
  color: string;
  bgColor: string;
  connected: boolean;
  lastSync?: string;
  metadata?: Record<string, string>;
}

const integrations: Integration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail to analyze email conversations with clients',
    icon: Mail,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Monitor client channels and DMs for sentiment and signals',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Track client project pages and comments for updates',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    connected: false,
  },
];

export default function IntegrationsPage() {
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>({
    gmail: false,
    slack: false,
    notion: false,
  });
  const [syncing, setSyncing] = useState<string | null>(null);

  const handleConnect = async (integrationId: string) => {
    // TODO: Implement OAuth flow
    // For now, redirect to the OAuth endpoint
    const oauthUrls: Record<string, string> = {
      gmail: '/api/integrations/gmail/auth',
      slack: '/api/integrations/slack/auth',
      notion: '/api/integrations/notion/auth',
    };

    window.location.href = oauthUrls[integrationId] || '#';
  };

  const handleDisconnect = async (integrationId: string) => {
    // TODO: Implement disconnect
    setIntegrationStates((prev) => ({ ...prev, [integrationId]: false }));
  };

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    // TODO: Trigger sync
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSyncing(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">
          Connect your communication tools to start monitoring client relationships
        </p>
      </div>

      <div className="grid gap-6">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integrationStates[integration.id];
          const isSyncing = syncing === integration.id;

          return (
            <div
              key={integration.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${integration.bgColor}`}>
                    <Icon className={`h-6 w-6 ${integration.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {integration.name}
                      </h3>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mt-1">{integration.description}</p>
                    {isConnected && integration.lastSync && (
                      <p className="text-xs text-gray-400 mt-2">
                        Last synced: {integration.lastSync}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleSync(integration.id)}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
                    >
                      Connect
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Integration-specific settings when connected */}
              {isConnected && integration.id === 'gmail' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Settings</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Analyze sent emails
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Analyze received emails
                    </label>
                  </div>
                </div>
              )}

              {isConnected && integration.id === 'slack' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Monitored Channels</h4>
                  <p className="text-sm text-gray-500">
                    Select which channels to monitor in your Slack workspace settings.
                  </p>
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
            <strong>1. Connect Gmail:</strong> Authorize access to analyze your email conversations.
            We only read metadata and content - nothing is stored permanently unless you enable it.
          </p>
          <p>
            <strong>2. Connect Slack:</strong> Add the RelIntel app to your workspace and select
            which channels to monitor for client communications.
          </p>
          <p>
            <strong>3. Connect Notion:</strong> Grant access to specific databases or pages where
            you track client projects and feedback.
          </p>
        </div>
      </div>
    </div>
  );
}
