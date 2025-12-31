'use client';

import { Play, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function DemoBanner() {
  const { isDemo } = useAuth();

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Play className="h-4 w-4" />
          <span>
            <strong>Demo Mode</strong> — You&apos;re viewing sample data.
          </span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Sign in for full access
        </Link>
      </div>
    </div>
  );
}
