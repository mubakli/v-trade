'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import TradeModal from './TradeModal';

interface PortfolioHolding {
  id: string;
  symbol: string;
  coinId: string;
  amount: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

interface PortfolioProps {
  onTradeComplete: () => void;
}

export default function Portfolio({ onTradeComplete }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.portfolio);
        setTotalValue(data.totalValue);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellClick = (holding: PortfolioHolding) => {
    setSelectedHolding({
      id: holding.coinId,
      symbol: holding.symbol,
      name: holding.symbol,
      current_price: holding.currentPrice,
      image: `https://assets.coingecko.com/coins/images/1/small/${holding.coinId}.png`,
    });
    setTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    setTradeModalOpen(false);
    onTradeComplete();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-700 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Holdings Yet</h3>
            <p className="text-slate-400">Start trading to build your portfolio</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalProfitLoss = portfolio.reduce((sum, h) => sum + h.profitLoss, 0);
  const totalCost = portfolio.reduce((sum, h) => sum + (h.amount * h.averageBuyPrice), 0);
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  return (
    <>
      {/* Summary Card */}
      <div className="mb-6 relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        <Card className="relative border-border bg-card/60 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="px-4 first:pl-0">
                <p className="text-muted-foreground text-sm font-medium mb-1">Total Portfolio Value</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${totalValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="pt-4 md:pt-0 px-4">
                <p className="text-muted-foreground text-sm font-medium mb-1">Total Profit/Loss</p>
                <p
                  className={`text-3xl font-bold tracking-tight ${
                    totalProfitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {totalProfitLoss >= 0 ? '+' : ''}$
                  {totalProfitLoss.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="pt-4 md:pt-0 px-4">
                <p className="text-muted-foreground text-sm font-medium mb-1">Total Return</p>
                <p
                  className={`text-3xl font-bold tracking-tight ${
                    totalProfitLossPercentage >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {totalProfitLossPercentage >= 0 ? '+' : ''}
                  {totalProfitLossPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <div className="grid grid-cols-1 gap-4">
        {portfolio.map((holding) => (
          <Card key={holding.id} className="hover:bg-accent/50 transition-colors group">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Header / Main Info */}
                <div className="flex items-center justify-between sm:block flex-1 min-w-[150px]">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{holding.symbol}</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      {holding.amount.toFixed(8)} {holding.symbol}
                    </p>
                  </div>
                  {/* Mobile Sell Button */}
                  <div className="sm:hidden">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSellClick(holding)}
                      className="shadow-lg shadow-destructive/20"
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-4 sm:gap-0 w-full sm:w-auto">
                  <div className="flex-1 text-left sm:text-center hidden md:block">
                    <p className="text-sm text-muted-foreground mb-1">Avg. Buy Price</p>
                    <p className="text-foreground font-medium font-mono">
                      ${holding.averageBuyPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex-1 text-left sm:text-center hidden md:block">
                    <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                    <p className="text-foreground font-medium font-mono">
                      ${holding.currentPrice.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex-1 text-left sm:text-center">
                    <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                    <p className="text-foreground font-bold font-mono">
                      ${holding.currentValue.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex-1 text-left sm:text-center">
                    <p className="text-sm text-muted-foreground mb-1">Profit/Loss</p>
                    <p
                      className={`font-bold font-mono ${
                        holding.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {holding.profitLoss >= 0 ? '+' : ''}$
                      {holding.profitLoss.toFixed(2)}
                      <span className="block sm:inline text-xs sm:ml-1 opacity-75">
                        ({holding.profitLossPercentage >= 0 ? '+' : ''}
                        {holding.profitLossPercentage.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Desktop Sell Button */}
                <div className="hidden sm:block ml-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleSellClick(holding)}
                    className="shadow-lg shadow-destructive/20"
                  >
                    Sell
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedHolding && (
        <TradeModal
          isOpen={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          crypto={selectedHolding}
          onSuccess={handleTradeSuccess}
          initialMode="SELL"
        />
      )}
    </>
  );
}
