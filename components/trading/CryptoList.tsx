import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import TradeModal from './TradeModal';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

interface CryptoListProps {
  onTradeComplete: () => void;
}

export default function CryptoList({ onTradeComplete }: CryptoListProps) {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchCryptos(debouncedQuery);
    // Refresh prices every 30 seconds
    const interval = setInterval(() => fetchCryptos(debouncedQuery), 30000);
    return () => clearInterval(interval);
  }, [debouncedQuery]);

  const fetchCryptos = async (query: string = '') => {
    try {
      // Don't set loading on every poll, only on query change if needed
      // But for simplicity, we might just want to show a small indicator or keep existing data
      if (query !== debouncedQuery) setLoading(true); // crude attempt, but logic is handled by effect dependencies
      
      const endpoint = query 
        ? `/api/crypto?query=${encodeURIComponent(query)}` 
        : '/api/crypto';
        
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setCryptos(data.cryptos);
      }
    } catch (error) {
      console.error('Error fetching cryptos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoClick = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
    setTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    setTradeModalOpen(false);
    onTradeComplete();
  };

  // No longer filtering locally
  const filteredCryptos = cryptos;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-1/6"></div>
                </div>
                <div className="h-6 bg-white/10 rounded w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search assets (e.g. Bitcoin, BTC)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredCryptos.length > 0 ? (
          filteredCryptos.map((crypto) => (
            <Card
              key={crypto.id}
              className="hover:bg-accent/50 transition-all duration-300 cursor-pointer group"
              onClick={() => handleCryptoClick(crypto)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-12 h-12 rounded-full shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {crypto.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <p className="text-lg sm:text-xl font-bold text-foreground font-mono">
                      ${crypto.current_price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        crypto.price_change_percentage_24h >= 0
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>

                  <div className="ml-8 hidden sm:block">
                    <Button className="shadow-lg shadow-primary/20">
                      Trade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-border/50 border-dashed">
            No assets found matching "{searchQuery}"
          </div>
        )}
      </div>

      {selectedCrypto && (
        <TradeModal
          isOpen={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          crypto={selectedCrypto}
          onSuccess={handleTradeSuccess}
        />
      )}
    </>
  );
}
