// CoinGecko API Service with caching
interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

interface CoinGeckoCrypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function getTopCryptos(limit: number = 50): Promise<CryptoPrice[]> {
  const cacheKey = `top-cryptos-${limit}`;
  const cached = getCached<CryptoPrice[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoCrypto[] = await response.json();
    const formatted: CryptoPrice[] = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap,
      image: coin.image,
    }));

    setCache(cacheKey, formatted);
    return formatted;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    throw error;
  }
}

export async function getCryptoPrice(coinId: string): Promise<number> {
  const cacheKey = `price-${coinId}`;
  const cached = getCached<number>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (!price) {
      throw new Error(`Price not found for ${coinId}`);
    }

    setCache(cacheKey, price);
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    throw error;
  }
}

export async function getMultiplePrices(coinIds: string[]): Promise<Record<string, number>> {
  const cacheKey = `prices-${coinIds.sort().join(',')}`;
  const cached = getCached<Record<string, number>>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 30 } }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const coinId of coinIds) {
      if (data[coinId]?.usd) {
        prices[coinId] = data[coinId].usd;
      }
    }

    setCache(cacheKey, prices);
    return prices;
  } catch (error) {
    console.error('Error fetching multiple prices:', error);
    throw error;
  }
}

export async function searchCrypto(query: string): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const coinIds = data.coins.slice(0, 10).map((coin: any) => coin.id);

    if (coinIds.length === 0) return [];

    // Get detailed info for search results
    const detailedResponse = await fetch(
      `${BASE_URL}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&sparkline=false`
    );

    if (!detailedResponse.ok) {
      throw new Error(`CoinGecko API error: ${detailedResponse.status}`);
    }

    const detailedData: CoinGeckoCrypto[] = await detailedResponse.json();
    return detailedData.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap,
      image: coin.image,
    }));
  } catch (error) {
    console.error('Error searching crypto:', error);
    throw error;
  }
}
