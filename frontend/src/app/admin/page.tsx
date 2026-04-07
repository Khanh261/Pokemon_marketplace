'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/context/wallet-context';
import { useContractStats } from '@/hooks/usePokemon';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading } = useWallet();
  const { data: stats, isLoading: statsLoading } = useContractStats();

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/');
  }, [isAdmin, isLoading, router]);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="animate-spin text-4xl">⚡</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-100 mb-8">Admin Dashboard</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Minted', value: statsLoading ? '...' : stats?.totalMinted ?? '—', icon: '🎨' },
            { label: 'Commission Rate', value: statsLoading ? '...' : stats?.commissionRate != null ? `${stats.commissionRate}%` : '—', icon: '💰' },
            { label: 'Commission Earned', value: statsLoading ? '...' : stats?.totalCommission != null ? `${stats.totalCommission} ETH` : '—', icon: '📈' },
            { label: 'Tokens For Sale', value: statsLoading ? '...' : stats?.tokensForSale ?? '—', icon: '🏷️' },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center"
            >
              <span className="text-3xl mb-2">{card.icon}</span>
              <span className="text-2xl font-bold text-gray-100">{card.value}</span>
              <span className="text-sm text-gray-400 mt-1">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/pokemon/new"
              className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              + Create Pokemon
            </Link>
            <Link
              href="/"
              className="bg-gray-700 text-gray-300 py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              View Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
