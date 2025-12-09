'use client';

import { useState, useEffect } from 'react';
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
  Mic,
  PenLine,
  Edit3,
  X,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react';
import InsightCard from '@/components/InsightCard';
import type { Client, Communication, Insight } from '@/types';

const sourceIcons: Record<string, typeof Mail> = {
  gmail: Mail,
  slack: MessageSquare,
  notion: FileText,
  transcript: Mic,
  manual: PenLine,
};

const sourceColors: Record<string, string> = {
  gmail: 'bg-red-100 text-red-600',
  slack: 'bg-purple-100 text-purple-600',
  notion: 'bg-gray-100 text-gray-600',
  transcript: 'bg-amber-100 text-amber-600',
  manual: 'bg-green-100 text-green-600',
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

  const [client, setClient] = useState<Client | null>(null);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    contract_value: '',
    contract_type: 'monthly' as 'monthly' | 'annual' | 'project',
    renewal_date: '',
    project_status: '',
    goals: '',
    known_concerns: '',
  });

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client data');
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setClient(data.client);
      setCommunications(data.communications || []);
      setInsights(data.insights || []);
    } catch (err) {
      console.error('Failed to fetch client:', err);
      setError(err instanceof Error ? err.message : 'Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessage = async () => {
    if (!client) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          clientName: client.name,
          company: client.company,
        }),
      });
      const data = await response.json();
      if (data.message) {
        setDraftMessage(data.message);
      }
    } catch (err) {
      console.error('Failed to generate message:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const openEditModal = () => {
    if (client) {
      setEditForm({
        contract_value: client.contract_value?.toString() || '',
        contract_type: client.contract_type || 'monthly',
        renewal_date: client.renewal_date || '',
        project_status: client.project_status || '',
        goals: client.goals || '',
        known_concerns: client.known_concerns?.join(', ') || '',
      });
      setShowEditModal(true);
    }
  };

  const handleSaveClient = async () => {
    if (!client) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_value: editForm.contract_value ? parseFloat(editForm.contract_value) : null,
          contract_type: editForm.contract_type,
          renewal_date: editForm.renewal_date || null,
          project_status: editForm.project_status || null,
          goals: editForm.goals || null,
          known_concerns: editForm.known_concerns
            ? editForm.known_concerns.split(',').map(s => s.trim()).filter(Boolean)
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      const data = await response.json();
      setClient(data.client);
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to save client:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <div className={`rounded-xl p-12 text-center ${error ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
          <AlertTriangle className={`h-8 w-8 mx-auto mb-3 ${error ? 'text-red-500' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-semibold mb-2 ${error ? 'text-red-800' : 'text-gray-900'}`}>
            {error ? 'Failed to Load Client' : 'Client not found'}
          </h3>
          <p className={error ? 'text-red-600 mb-4' : 'text-gray-500'}>
            {error || "The client you're looking for doesn't exist."}
          </p>
          {error && (
            <button
              onClick={() => {
                setLoading(true);
                fetchClientData();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const config = statusConfig[client.status];
  const StatusIcon = config.icon;

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
              <p className="text-gray-500">{client.company || 'No company'}</p>
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

          <div className="flex items-start gap-4">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Edit Details
            </button>
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
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Client Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                Adding business context helps generate more valuable, specific insights.
              </p>

              {/* Contract Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Contract Value
                  </label>
                  <input
                    type="number"
                    value={editForm.contract_value}
                    onChange={(e) => setEditForm({ ...editForm, contract_value: e.target.value })}
                    placeholder="e.g., 5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type
                  </label>
                  <select
                    value={editForm.contract_type}
                    onChange={(e) => setEditForm({ ...editForm, contract_type: e.target.value as 'monthly' | 'annual' | 'project' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="project">Project-based</option>
                  </select>
                </div>
              </div>

              {/* Renewal Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Renewal Date
                </label>
                <input
                  type="date"
                  value={editForm.renewal_date}
                  onChange={(e) => setEditForm({ ...editForm, renewal_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Project Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Project / Status
                </label>
                <input
                  type="text"
                  value={editForm.project_status}
                  onChange={(e) => setEditForm({ ...editForm, project_status: e.target.value })}
                  placeholder="e.g., Phase 2 - Dashboard development"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Target className="h-4 w-4 inline mr-1" />
                  Client Goals
                </label>
                <textarea
                  value={editForm.goals}
                  onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })}
                  placeholder="What does success look like for this client?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Known Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Known Concerns (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.known_concerns}
                  onChange={(e) => setEditForm({ ...editForm, known_concerns: e.target.value })}
                  placeholder="e.g., Timeline delays, Budget constraints"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        {/* Communications */}
        <div className="col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Communications</h2>
          {communications.length > 0 ? (
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
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <p className="text-gray-500">No communications synced for this client yet.</p>
              <Link
                href="/dashboard/integrations"
                className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Sync Messages
              </Link>
            </div>
          )}

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
                Copy Message
              </button>
            </div>
          </div>
        </div>

        {/* Insights Sidebar */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">No insights yet. Sync and analyze messages to generate insights.</p>
            </div>
          )}

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
                <dt className="text-gray-500">Messages</dt>
                <dd className="text-gray-900">{communications.length}</dd>
              </div>
              {client.contract_value && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Contract</dt>
                  <dd className="text-gray-900 font-medium">
                    ${client.contract_value.toLocaleString()}/{client.contract_type || 'mo'}
                  </dd>
                </div>
              )}
              {client.renewal_date && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Renewal</dt>
                  <dd className="text-gray-900">{format(new Date(client.renewal_date), 'MMM d, yyyy')}</dd>
                </div>
              )}
            </dl>
            {(client.project_status || client.goals || (client.known_concerns && client.known_concerns.length > 0)) && (
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                {client.project_status && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Project</dt>
                    <dd className="text-sm text-gray-900">{client.project_status}</dd>
                  </div>
                )}
                {client.goals && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Goals</dt>
                    <dd className="text-sm text-gray-900">{client.goals}</dd>
                  </div>
                )}
                {client.known_concerns && client.known_concerns.length > 0 && (
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Concerns</dt>
                    <dd className="flex flex-wrap gap-1">
                      {client.known_concerns.map((concern, idx) => (
                        <span key={idx} className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded">
                          {concern}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
