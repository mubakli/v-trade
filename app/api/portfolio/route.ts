import { db } from "@/lib/db";
import { portfolios, transactions } from "@/lib/db/schema";
import { verifyAuth } from "@/lib/middleware/auth";
import { getMultiplePrices } from "@/lib/services/crypto-api";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'history') {
      return getTransactionHistory(auth.userId);
    } else {
      return getPortfolio(auth.userId);
    }
  } catch (error) {
    console.error("Portfolio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function getPortfolio(userId: string) {
  const userPortfolios = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.userId, userId));

  if (userPortfolios.length === 0) {
    return NextResponse.json({ 
      portfolio: [],
      totalValue: 0,
    });
  }

  // Get current prices for all holdings
  const coinIds = userPortfolios.map(p => p.coinId);
  const prices = await getMultiplePrices(coinIds);

  // Calculate portfolio with current values
  const portfolioWithValues = userPortfolios.map(holding => {
    const currentPrice = prices[holding.coinId] || 0;
    const amount = parseFloat(holding.amount);
    const avgBuyPrice = parseFloat(holding.averageBuyPrice);
    const currentValue = amount * currentPrice;
    const totalCost = amount * avgBuyPrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    return {
      id: holding.id,
      symbol: holding.symbol,
      coinId: holding.coinId,
      amount: parseFloat(holding.amount),
      averageBuyPrice: avgBuyPrice,
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercentage,
    };
  });

  const totalValue = portfolioWithValues.reduce((sum, h) => sum + h.currentValue, 0);

  return NextResponse.json({
    portfolio: portfolioWithValues,
    totalValue,
  });
}

async function getTransactionHistory(userId: string) {
  const history = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(100);

  return NextResponse.json({ history });
}
