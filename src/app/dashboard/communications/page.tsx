'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, MessageSquare, FileText, Search, Filter } from 'lucide-react';
import type { Communication } from '@/types';

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

// Demo data
const demoCommunications: (Communication & { client_name: string })[] = [
  {
    id: '1',
    client_id: '1',
    client_name: 'Dear Health',
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
    client_name: 'Dear Health',
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
    client_id: '2',
    client_name: 'Acme Corp',
    source: 'gmail',
    source_id: 'msg3',
    subject: 'Timeline concerns',
    content: "I'm a bit concerned about where we're at with the timeline. Can we get an update on when this will be resolved? We were expecting delivery last week.",
    sender: 'pm@acme.com',
    recipient: 'you@example.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    analyzed: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    client_id: '3',
    client_name: 'TechStart',
    source: 'slack',
    source_id: 'msg4',
    content: "We're looking at expanding into APAC next quarter. What would it take to scale what we have now? Would love to chat about options.",
    sender: 'CEO @ TechStart',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    analyzed: true,
    created_at: new Date().toISOString(),
  },
];

export default function CommunicationsPage() {
  const [communications] = useState(demoCommunications);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredCommunications = communications.filter((comm) => {
    const matchesSearch =
      comm.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || comm.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

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
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCommunications.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No communications found</p>
        </div>
      )}
    </div>
  );
}
