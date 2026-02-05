'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletBalance from '@/components/trading/WalletBalance';
import CryptoList from '@/components/trading/CryptoList';
import Portfolio from '@/components/trading/Portfolio';
import TransactionHistory from '@/components/trading/TransactionHistory';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'history'>('market');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTradeComplete = () => {
    // Refresh all components after a trade
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Trading Dashboard</h1>
          <p className="text-slate-400">Manage your portfolio and trade cryptocurrencies</p>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="mb-8">
        <WalletBalance key={refreshKey} />
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 border-b border-white/5 pb-1 w-max md:w-auto">
          <Button
            variant={activeTab === 'market' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('market')}
            className={`rounded-b-none rounded-t-lg whitespace-nowrap ${activeTab === 'market' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Market
          </Button>
          <Button
            variant={activeTab === 'portfolio' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('portfolio')}
            className={`rounded-b-none rounded-t-lg whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            Portfolio
          </Button>
          <Button
            variant={activeTab === 'history' ? 'secondary' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className={`rounded-b-none rounded-t-lg whitespace-nowrap ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
          >
            History
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'market' && (
          <CryptoList key={refreshKey} onTradeComplete={handleTradeComplete} />
        )}
        {activeTab === 'portfolio' && (
          <Portfolio key={refreshKey} onTradeComplete={handleTradeComplete} />
        )}
        {activeTab === 'history' && (
          <TransactionHistory key={refreshKey} />
        )}
      </div>
    </div>
  );
}
