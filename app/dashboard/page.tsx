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
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500 bg-grid-pattern min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-2 tracking-tighter uppercase">Trading Dashboard</h1>
          <p className="text-muted-foreground font-mono tracking-wide">Manage your portfolio and trade cryptocurrencies</p>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="mb-8">
        <WalletBalance key={refreshKey} />
      </div>

      {/* Tabs */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 border-b-2 border-border pb-0 w-max md:w-auto">
          <Button
            variant={activeTab === 'market' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('market')}
            className={`rounded-none border-b-0 ${activeTab === 'market' ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground'}`}
          >
            MARKET
          </Button>
          <Button
            variant={activeTab === 'portfolio' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('portfolio')}
            className={`rounded-none border-b-0 ${activeTab === 'portfolio' ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground'}`}
          >
            PORTFOLIO
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className={`rounded-none border-b-0 ${activeTab === 'history' ? 'bg-foreground text-background hover:bg-foreground/90' : 'text-muted-foreground'}`}
          >
            HISTORY
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
