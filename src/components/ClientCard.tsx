'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import type { Client } from '@/types';

const statusConfig = {
  healthy: {
    label: 'Healthy',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  at_risk: {
    label: 'At Risk',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
  },
  opportunity: {
    label: 'Opportunity',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: TrendingUp,
    iconColor: 'text-blue-500',
  },
  neutral: {
    label: 'Neutral',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock,
    iconColor: 'text-gray-500',
  },
};

interface ClientCardProps {
  client: Client;
  latestInsight?: string;
}

export default function ClientCard({ client, latestInsight }: ClientCardProps) {
  const config = statusConfig[client.status];
  const StatusIcon = config.icon;

  return (
    <Link href={`/dashboard/clients/${client.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
              <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{client.name}</h3>
              {client.company && (
                <p className="text-sm text-gray-500">{client.company}</p>
              )}
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.label}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Health Score</span>
            <span className="font-medium text-gray-900">{client.health_score}%</span>
          </div>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
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

        {latestInsight && (
          <p className="mt-4 text-sm text-gray-600 line-clamp-2">{latestInsight}</p>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>
            Last contact:{' '}
            {formatDistanceToNow(new Date(client.last_contact), { addSuffix: true })}
          </span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
