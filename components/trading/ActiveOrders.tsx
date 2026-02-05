'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { X, TrendingDown, TrendingUp } from 'lucide-react';

interface Order {
  id: string;
  symbol: string;
  coinId: string;
  orderType: string;
  triggerPrice: string;
  amount: string;
  createdAt: string;
}

interface ActiveOrdersProps {
  onOrderExecuted?: () => void;
}

export default function ActiveOrders({ onOrderExecuted }: ActiveOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchOrders();
    fetchPrices();
    
    // Poll for price updates every 30 seconds
    const interval = setInterval(() => {
      fetchPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/crypto');
      if (res.ok) {
        const data = await res.json();
        const priceMap: Record<string, number> = {};
        data.cryptos.forEach((crypto: any) => {
          priceMap[crypto.id] = crypto.current_price;
        });
        setPrices(priceMap);
        
        // Check if any orders should be executed
        checkOrders(priceMap);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const checkOrders = async (currentPrices: Record<string, number>) => {
    try {
      const res = await fetch('/api/orders/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: currentPrices }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.executedOrders && data.executedOrders.length > 0) {
          // Refresh orders list
          fetchOrders();
          // Notify parent component
          onOrderExecuted?.();
        }
      }
    } catch (error) {
      console.error('Error checking orders:', error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Remove order from list
        setOrders(orders.filter(o => o.id !== orderId));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const getDistanceFromPrice = (order: Order) => {
    const currentPrice = prices[order.coinId];
    if (!currentPrice) return null;

    const triggerPrice = parseFloat(order.triggerPrice);
    const diff = ((triggerPrice - currentPrice) / currentPrice) * 100;
    
    return {
      percentage: Math.abs(diff).toFixed(2),
      direction: diff > 0 ? 'above' : 'below',
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return null; // Don't show component if no orders
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Active Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => {
            const distance = getDistanceFromPrice(order);
            const currentPrice = prices[order.coinId];

            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {order.orderType === 'STOP_LOSS' ? (
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    )}
                    <span className="font-semibold text-foreground">
                      {order.symbol}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.orderType === 'STOP_LOSS'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}
                    >
                      {order.orderType === 'STOP_LOSS' ? 'Stop Loss' : 'Take Profit'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-mono">
                      {parseFloat(order.amount).toFixed(8)} {order.symbol}
                    </span>
                    {' @ '}
                    <span className="font-mono font-semibold text-foreground">
                      ${parseFloat(order.triggerPrice).toFixed(2)}
                    </span>
                  </div>
                  {distance && currentPrice && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Current: ${currentPrice.toFixed(2)} ({distance.percentage}% {distance.direction})
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => cancelOrder(order.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
