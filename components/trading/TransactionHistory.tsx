'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface Transaction {
  id: string;
  type: string;
  symbol: string;
  amount: string;
  pricePerUnit: string;
  totalValue: string;
  createdAt: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/portfolio?type=history');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.history);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground">Your trading history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-4 font-medium text-muted-foreground">Type</th>
                <th className="pb-4 font-medium text-muted-foreground">Asset</th>
                <th className="pb-4 font-medium text-muted-foreground text-right md:text-left">Amount</th>
                <th className="pb-4 font-medium text-muted-foreground text-right md:text-left">Price</th>
                <th className="pb-4 font-medium text-muted-foreground text-right md:text-left">Total Value</th>
                <th className="pb-4 font-medium text-muted-foreground text-right md:text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-muted/10 transition-colors group"
                >
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.type === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-4 font-semibold text-foreground">{tx.symbol}</td>
                  <td className="py-4 font-mono text-sm text-right md:text-left text-muted-foreground">
                    {parseFloat(tx.amount).toFixed(8)}
                  </td>
                  <td className="py-4 font-mono text-sm text-right md:text-left text-muted-foreground">
                    ${parseFloat(tx.pricePerUnit).toFixed(2)}
                  </td>
                  <td className="py-4 font-mono text-sm font-bold text-right md:text-left text-foreground">
                    ${parseFloat(tx.totalValue).toFixed(2)}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground text-right md:text-left">
                    {new Date(tx.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
