'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface Wallet {
  id: string;
  balance: string;
  currency: string;
}

interface Portfolio {
  currentValue: number;
}

export default function WalletBalance() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch wallet
      const walletRes = await fetch('/api/wallet');
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData.wallet);
      }

      // Fetch portfolio value
      const portfolioRes = await fetch('/api/portfolio');
      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setPortfolioValue(portfolioData.totalValue || 0);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-white/10 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const totalValue = balance + portfolioValue;

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30 rounded-xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
      <Card className="relative border-border bg-card/40 backdrop-blur-md">
        <CardContent className="pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Cash Balance */}
            <div className="px-4 first:pl-0 flex items-center justify-between md:block">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Cash Balance</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center md:hidden">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Portfolio Value */}
            <div className="pt-6 md:pt-0 px-4 flex items-center justify-between md:block">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Portfolio Value</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center md:hidden">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>

            {/* Total Value */}
            <div className="pt-6 md:pt-0 px-4 flex items-center justify-between md:block">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Total Net Worth</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center md:hidden">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
