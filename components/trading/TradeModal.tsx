'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  crypto: Crypto;
  onSuccess: () => void;
  initialMode?: 'BUY' | 'SELL';
}

export default function TradeModal({
  isOpen,
  onClose,
  crypto,
  onSuccess,
  initialMode = 'BUY',
}: TradeModalProps) {
  const [mode, setMode] = useState<'BUY' | 'SELL'>(initialMode);
  const [inputMode, setInputMode] = useState<'CRYPTO' | 'USD'>('CRYPTO');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wallet, setWallet] = useState<any>(null);
  const [holdings, setHoldings] = useState(0);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  
  // Stop-loss and take-profit state
  const [enableStopLoss, setEnableStopLoss] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [enableTakeProfit, setEnableTakeProfit] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWalletAndHoldings();
    }
  }, [isOpen]);

  const fetchWalletAndHoldings = async () => {
    try {
      // Fetch wallet
      const walletRes = await fetch('/api/wallet');
      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data.wallet);
      }

      // Fetch portfolio to check holdings
      const portfolioRes = await fetch('/api/portfolio');
      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        const holding = data.portfolio.find((p: any) => p.coinId === crypto.id);
        setHoldings(holding ? holding.amount : 0);
        setPortfolioId(holding ? holding.id : null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Calculate crypto amount based on input mode
  const getCryptoAmount = () => {
    if (!amount) return 0;
    const amountNum = parseFloat(amount);
    if (inputMode === 'USD') {
      return amountNum / crypto.current_price;
    }
    return amountNum;
  };

  // Calculate USD value based on input mode
  const getUSDValue = () => {
    if (!amount) return 0;
    const amountNum = parseFloat(amount);
    if (inputMode === 'CRYPTO') {
      return amountNum * crypto.current_price;
    }
    return amountNum;
  };

  const createOrders = async (newPortfolioId?: string) => {
    const pidToUse = newPortfolioId || portfolioId;
    if (!pidToUse) return;

    const cryptoAmount = getCryptoAmount();

    try {
      // Create stop-loss order if enabled
      if (enableStopLoss && stopLossPrice) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: pidToUse,
            symbol: crypto.symbol,
            coinId: crypto.id,
            orderType: 'STOP_LOSS',
            triggerPrice: parseFloat(stopLossPrice),
            amount: cryptoAmount,
          }),
        });
      }

      // Create take-profit order if enabled
      if (enableTakeProfit && takeProfitPrice) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: pidToUse,
            symbol: crypto.symbol,
            coinId: crypto.id,
            orderType: 'TAKE_PROFIT',
            triggerPrice: parseFloat(takeProfitPrice),
            amount: cryptoAmount,
          }),
        });
      }
    } catch (error) {
      console.error('Error creating orders:', error);
      // Don't fail the trade if order creation fails
    }
  };

  const handleTrade = async () => {
    setError('');
    const cryptoAmount = getCryptoAmount();
    const usdValue = getUSDValue();

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (mode === 'SELL' && cryptoAmount > holdings) {
      setError(`You only have ${holdings} ${crypto.symbol}`);
      return;
    }

    if (mode === 'BUY' && wallet && parseFloat(wallet.balance) < usdValue) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode,
          coinId: crypto.id,
          symbol: crypto.symbol,
          amount: cryptoAmount,
          pricePerUnit: crypto.current_price,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If it's a buy and we have stop-loss/take-profit enabled, create orders
        if (mode === 'BUY') {
          await createOrders(data.portfolio?.id);
        }
        onSuccess();
        setAmount('');
        setStopLossPrice('');
        setTakeProfitPrice('');
        setEnableStopLoss(false);
        setEnableTakeProfit(false);
      } else {
        setError(data.error || 'Trade failed');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const cryptoAmount = getCryptoAmount();
  const usdValue = getUSDValue();
  const balance = wallet ? parseFloat(wallet.balance) : 0;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full h-full md:h-auto md:rounded-2xl border-0 md:border border-border md:max-w-md p-4 md:p-6 shadow-2xl relative overflow-y-auto md:max-h-[85vh]">
        {/* Glow effects */}
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b md:border-0 border-border/50">
          <div className="flex items-center gap-3">
            <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full bg-white/5 p-1" />
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Trade {crypto.name}
                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {crypto.symbol.toUpperCase()}
                </span>
              </h2>
              <p className="text-sm font-medium text-primary">
                ${crypto.current_price.toLocaleString()}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-secondary">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex p-1 bg-secondary rounded-xl mb-6">
          <button
            onClick={() => setMode('BUY')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              mode === 'BUY'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setMode('SELL')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              mode === 'SELL'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Current Price */}
        <div className="mb-6 px-4 py-3 bg-secondary/50 rounded-xl border border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Price</span>
            <span className="text-lg font-mono font-bold text-foreground">
              ${crypto.current_price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
        </div>

        {/* Input Mode Toggle */}
        <div className="mb-2 flex justify-end">
          <div className="flex gap-1 text-xs font-medium bg-secondary p-1 rounded-lg">
            <button
              onClick={() => {
                setInputMode('CRYPTO');
                setAmount('');
              }}
              className={`px-3 py-1 rounded-md transition-all ${
                inputMode === 'CRYPTO'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {crypto.symbol}
            </button>
            <button
              onClick={() => {
                setInputMode('USD');
                setAmount('');
              }}
              className={`px-3 py-1 rounded-md transition-all ${
                inputMode === 'USD'
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground mb-2 ml-1">
            Amount
          </label>
          <div className="relative">
            {inputMode === 'USD' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                $
              </span>
            )}
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step={inputMode === 'USD' ? '0.01' : '0.00000001'}
              className={`${inputMode === 'USD' ? 'pl-7' : ''} font-mono text-lg bg-secondary/50`}
              autoFocus
            />
          </div>
        </div>

        {/* Conversion Display */}
        <div className="mb-6 px-4 py-3 bg-secondary/50 rounded-xl border border-border">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {inputMode === 'CRYPTO' ? 'Estimated Cost' : 'Estimated Amount'}
            </p>
            <p className="text-lg font-mono font-bold text-foreground">
              {inputMode === 'CRYPTO' ? (
                `$${usdValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              ) : (
                `${cryptoAmount.toFixed(8)} ${crypto.symbol}`
              )}
            </p>
          </div>
        </div>

        {/* Stop-Loss and Take-Profit (only for BUY mode) */}
        {mode === 'BUY' && (
          <div className="mb-6 space-y-4">
            {/* Stop-Loss */}
            <div className="p-4 rounded-xl border border-border bg-secondary/20">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Stop-Loss
                </label>
                <button
                  type="button"
                  onClick={() => setEnableStopLoss(!enableStopLoss)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableStopLoss ? 'bg-rose-500' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableStopLoss ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {enableStopLoss && (
                <div>
                  <Input
                    type="number"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    placeholder={`< $${crypto.current_price.toFixed(2)}`}
                    step="0.01"
                    className="font-mono bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sell if price drops to this level
                  </p>
                </div>
              )}
            </div>

            {/* Take-Profit */}
            <div className="p-4 rounded-xl border border-border bg-secondary/20">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Take-Profit
                </label>
                <button
                  type="button"
                  onClick={() => setEnableTakeProfit(!enableTakeProfit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    enableTakeProfit ? 'bg-emerald-500' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enableTakeProfit ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {enableTakeProfit && (
                <div>
                  <Input
                    type="number"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    placeholder={`> $${crypto.current_price.toFixed(2)}`}
                    step="0.01"
                    className="font-mono bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sell if price rises to this level
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Info */}
        <div className="mb-6 flex justify-between text-sm px-1">
          <div>
            <p className="text-muted-foreground mb-0.5">Available Balance</p>
            <p className="text-foreground font-medium">${balance.toFixed(2)}</p>
          </div>
          {mode === 'SELL' && (
            <div className="text-right">
              <p className="text-muted-foreground mb-0.5">Your Holdings</p>
              <p className="text-foreground font-medium">
                {holdings} {crypto.symbol}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-1">
            <p className="text-destructive text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleTrade}
          disabled={loading || !amount}
          className={`w-full py-6 text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${
            mode === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white'
              : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `${mode === 'BUY' ? 'Buy' : 'Sell'} ${crypto.symbol}`
          )}
        </Button>
      </div>
     {/* Backdrop for explicit click-out */}
     <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

