'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, MessageSquare, FileText, Search, Filter, AlertTriangle, RefreshCw, Mic, PenLine } from 'lucide-react';
import Link from 'next/link';
import type { Communication } from '@/types';

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

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<(Communication & { client_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setError(null);
      const response = await fetch('/api/communications');
      if (!response.ok) {
        throw new Error('Failed to fetch communications');
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCommunications(data.communications || []);
    } catch (err) {
      console.error('Failed to fetch communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load communications');
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunications = communications.filter((comm) => {
    const matchesSearch =
      comm.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || comm.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-500 mt-1">
            All client communications across your connected platforms
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Communications</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchCommunications();
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
        <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
        <p className="text-gray-500 mt-1">
          All client communications across your connected platforms
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search communications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="gmail">Gmail</option>
            <option value="slack">Slack</option>
            <option value="notion">Notion</option>
          </select>
        </div>
      </div>

      {/* Communications List */}
      {filteredCommunications.length > 0 ? (
        <div className="space-y-4">
          {filteredCommunications.map((comm) => {
            const SourceIcon = sourceIcons[comm.source];
            return (
              <div
                key={comm.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${sourceColors[comm.source]}`}>
                    <SourceIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{comm.sender}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-sm text-blue-600 font-medium">
                          {comm.client_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comm.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    {comm.subject && (
                      <p className="text-sm font-medium text-gray-700 mb-1">{comm.subject}</p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2">{comm.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        comm.analyzed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {comm.analyzed ? 'Analyzed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">
            {communications.length === 0
              ? 'No communications yet. Connect Slack and sync to see messages here.'
              : 'No communications match your search.'}
          </p>
          {communications.length === 0 && (
            <Link
              href="/dashboard/integrations"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Connect Slack
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
