'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DemoBanner from '@/components/DemoBanner';
import { useAuth } from '@/components/AuthProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isDemo, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted && !isAuthenticated && !isDemo) {
      router.push('/login');
    }
  }, [loading, mounted, isAuthenticated, isDemo, router]);

  // Show loading state while checking auth
  if (!mounted || loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Don't render if not authorized (will redirect)
  if (!isAuthenticated && !isDemo) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
