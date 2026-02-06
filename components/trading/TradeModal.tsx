'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!isOpen || !mounted) return null;

  const cryptoAmount = getCryptoAmount();
  const usdValue = getUSDValue();
  const balance = wallet ? parseFloat(wallet.balance) : 0;

  return createPortal(
    <div className="fixed inset-0 bg-background/90 backdrop-blur-none flex items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full h-full md:h-auto md:max-h-[85vh] md:rounded-none border-0 md:border-2 border-border md:max-w-md p-4 md:p-6 shadow-none relative overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-card z-10 pb-2 border-b-2 border-border">
          <div className="flex items-center gap-3">
            <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-none bg-secondary/20 p-1 border border-border" />
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
                Trade {crypto.name}
              </h2>
              <p className="text-sm font-bold text-primary font-mono rounded-none">
                ${crypto.current_price.toLocaleString()} <span className="text-muted-foreground text-xs">{crypto.symbol.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-none hover:bg-destructive hover:text-destructive-foreground border border-transparent hover:border-destructive">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-2 border-border mb-6">
          <button
            onClick={() => setMode('BUY')}
            className={`flex-1 py-3 font-bold text-sm uppercase tracking-wide transition-all ${
              mode === 'BUY'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Buy
          </button>
          <div className="w-0.5 bg-border self-stretch"></div>
          <button
            onClick={() => setMode('SELL')}
            className={`flex-1 py-3 font-bold text-sm uppercase tracking-wide transition-all ${
              mode === 'SELL'
                ? 'bg-destructive text-destructive-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Current Price */}
        <div className="mb-6 px-4 py-3 bg-secondary rounded-none border border-border flex justify-between items-center">
            <span className="text-sm font-bold uppercase text-muted-foreground">Current Price</span>
            <span className="text-lg font-mono font-bold text-foreground">
              ${crypto.current_price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
        </div>

        {/* Input Mode Toggle */}
        <div className="mb-2 flex justify-end">
          <div className="flex gap-[-2px]">
            <button
              onClick={() => {
                setInputMode('CRYPTO');
                setAmount('');
              }}
              className={`px-3 py-1 text-xs font-bold border-2 border-border uppercase transition-all ${
                inputMode === 'CRYPTO'
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-muted-foreground hover:bg-secondary border-r-0'
              }`}
            >
              {crypto.symbol}
            </button>
            <button
              onClick={() => {
                setInputMode('USD');
                setAmount('');
              }}
              className={`px-3 py-1 text-xs font-bold border-2 border-border uppercase transition-all ${
                inputMode === 'USD'
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-muted-foreground hover:bg-secondary border-l-0'
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold uppercase text-muted-foreground mb-2">
            Amount
          </label>
          <div className="relative">
            {inputMode === 'USD' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-bold">
                $
              </span>
            )}
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step={inputMode === 'USD' ? '0.01' : '0.00000001'}
              className={`${inputMode === 'USD' ? 'pl-7' : ''} font-mono text-lg bg-background border-2 border-foreground`}
              autoFocus
            />
          </div>
        </div>

        {/* Conversion Display */}
        <div className="mb-6 px-4 py-3 bg-secondary rounded-none border border-border">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold uppercase text-muted-foreground">
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
            <div className="p-4 rounded-none border-2 border-border bg-background">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
                  <div className="w-3 h-3 bg-red-500 rounded-none transform rotate-45"></div>
                  Stop-Loss
                </label>
                <button
                  type="button"
                  onClick={() => setEnableStopLoss(!enableStopLoss)}
                  className={`w-12 h-6 border-2 border-foreground transition-colors flex items-center px-0.5 ${
                    enableStopLoss ? 'bg-foreground justify-end' : 'bg-background justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 border-2 border-foreground transition-all ${
                     enableStopLoss ? 'bg-background' : 'bg-foreground'
                  }`} />
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
                    className="font-mono bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">
                    Trigger Sell Price
                  </p>
                </div>
              )}
            </div>

            {/* Take-Profit */}
            <div className="p-4 rounded-none border-2 border-border bg-background">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
                   <div className="w-3 h-3 bg-emerald-500 rounded-none transform rotate-45"></div>
                  Take-Profit
                </label>
                <button
                  type="button"
                  onClick={() => setEnableTakeProfit(!enableTakeProfit)}
                  className={`w-12 h-6 border-2 border-foreground transition-colors flex items-center px-0.5 ${
                    enableTakeProfit ? 'bg-foreground justify-end' : 'bg-background justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 border-2 border-foreground transition-all ${
                     enableTakeProfit ? 'bg-background' : 'bg-foreground'
                  }`} />
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
                    className="font-mono bg-background"
                  />
                   <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">
                    Trigger Sell Price
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Info */}
        <div className="mb-6 flex justify-between text-sm px-1 font-mono">
          <div>
            <p className="text-muted-foreground mb-0.5 uppercase text-xs">Available Balance</p>
            <p className="text-foreground font-bold">${balance.toFixed(2)}</p>
          </div>
          {mode === 'SELL' && (
            <div className="text-right">
              <p className="text-muted-foreground mb-0.5 uppercase text-xs">Your Holdings</p>
              <p className="text-foreground font-bold">
                {holdings} {crypto.symbol}
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive text-destructive-foreground border-2 border-destructive rounded-none font-bold text-sm">
            {error}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleTrade}
          disabled={loading || !amount}
          className={`w-full py-6 text-lg font-black uppercase tracking-wider rounded-none transition-all active:translate-y-1 ${
            mode === 'BUY'
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-transparent'
              : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-2 border-transparent'
          }`}
        >
          {loading ? 'PROCESSING...' : `${mode === 'BUY' ? 'BUY' : 'SELL'} ${crypto.symbol}`}
        </Button>
      </div>
     <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>,
    document.body
  );
}

