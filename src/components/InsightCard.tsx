'use client';

import { AlertTriangle, TrendingUp, MessageCircle, Clock } from 'lucide-react';
import type { Insight } from '@/types';

const typeConfig = {
  risk: {
    label: 'Risk',
    color: 'bg-red-50 border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    badgeColor: 'bg-red-100 text-red-700',
  },
  opportunity: {
    label: 'Opportunity',
    color: 'bg-blue-50 border-blue-200',
    icon: TrendingUp,
    iconColor: 'text-blue-500',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  sentiment: {
    label: 'Sentiment',
    color: 'bg-purple-50 border-purple-200',
    icon: MessageCircle,
    iconColor: 'text-purple-500',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  action_needed: {
    label: 'Action Needed',
    color: 'bg-amber-50 border-amber-200',
    icon: Clock,
    iconColor: 'text-amber-500',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
};

const severityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

interface InsightCardProps {
  insight: Insight;
  clientName?: string;
  onAction?: () => void;
}

export default function InsightCard({ insight, clientName, onAction }: InsightCardProps) {
  const config = typeConfig[insight.type];
  const TypeIcon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <TypeIcon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.badgeColor}`}>
              {config.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColors[insight.severity]}`}>
              {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} Priority
            </span>
            {clientName && (
              <span className="text-xs text-gray-500">• {clientName}</span>
            )}
          </div>
          <h4 className="mt-2 font-medium text-gray-900">{insight.title}</h4>
          <p className="mt-1 text-sm text-gray-600">{insight.description}</p>

          {insight.evidence.length > 0 && (
            <div className="mt-3 space-y-2">
              {insight.evidence.slice(0, 2).map((snippet, i) => (
                <blockquote
                  key={i}
                  className="text-xs text-gray-500 italic border-l-2 border-gray-300 pl-3"
                >
                  "{snippet}"
                </blockquote>
              ))}
            </div>
          )}

          {insight.suggested_action && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onAction}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {insight.suggested_action} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
