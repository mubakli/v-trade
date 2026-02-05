import { db } from "@/lib/db";
import { wallets, portfolios, transactions } from "@/lib/db/schema";
import { verifyAuth } from "@/lib/middleware/auth";
import { buyTradeSchema, sellTradeSchema } from "@/lib/validation/trade";
import { eq, and, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type } = body;

    if (type === 'BUY') {
      return handleBuy(auth.userId, body);
    } else if (type === 'SELL') {
      return handleSell(auth.userId, body);
    } else {
      return NextResponse.json(
        { error: "Invalid trade type. Must be 'BUY' or 'SELL'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Trade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleBuy(userId: string, body: any) {
  const result = buyTradeSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { coinId, symbol, amount, pricePerUnit } = result.data;
  const totalCost = amount * pricePerUnit;

  // Get user's wallet
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet not found" },
      { status: 404 }
    );
  }

  const currentBalance = parseFloat(wallet.balance);

  // Check if user has enough balance
  if (currentBalance < totalCost) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  // Start transaction
  const newBalance = currentBalance - totalCost;

  // Update wallet balance
  await db
    .update(wallets)
    .set({ 
      balance: newBalance.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(wallets.userId, userId));

  // Record transaction first
  const [transaction] = await db
    .insert(transactions)
    .values({
      userId,
      type: 'BUY',
      symbol,
      coinId,
      amount: amount.toFixed(8),
      pricePerUnit: pricePerUnit.toFixed(2),
      totalValue: totalCost.toFixed(2),
      fee: '0',
    })
    .returning();

  // Check if user already has this crypto in portfolio
  const [existingPortfolio] = await db
    .select()
    .from(portfolios)
    .where(and(
      eq(portfolios.userId, userId),
      eq(portfolios.coinId, coinId)
    ))
    .limit(1);

  if (existingPortfolio) {
    // Update existing portfolio entry
    const currentAmount = parseFloat(existingPortfolio.amount);
    const currentAvgPrice = parseFloat(existingPortfolio.averageBuyPrice);
    const newAmount = currentAmount + amount;
    const newAvgPrice = ((currentAmount * currentAvgPrice) + (amount * pricePerUnit)) / newAmount;

    await db
      .update(portfolios)
      .set({
        amount: newAmount.toFixed(8),
        averageBuyPrice: newAvgPrice.toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, existingPortfolio.id));

    return NextResponse.json({
      message: "Buy order executed successfully",
      transaction,
      newBalance: newBalance.toFixed(2),
      portfolio: { id: existingPortfolio.id },
    });
  } else {
    // Create new portfolio entry
    const [newPortfolio] = await db
      .insert(portfolios)
      .values({
        userId,
        symbol,
        coinId,
        amount: amount.toFixed(8),
        averageBuyPrice: pricePerUnit.toFixed(2),
      })
      .returning();

    return NextResponse.json({
      message: "Buy order executed successfully",
      transaction,
      newBalance: newBalance.toFixed(2),
      portfolio: { id: newPortfolio.id },
    });
  }
}

async function handleSell(userId: string, body: any) {
  const result = sellTradeSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { coinId, symbol, amount, pricePerUnit } = result.data;
  const totalProceeds = amount * pricePerUnit;

  // Check if user has this crypto in portfolio
  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(and(
      eq(portfolios.userId, userId),
      eq(portfolios.coinId, coinId)
    ))
    .limit(1);

  if (!portfolio) {
    return NextResponse.json(
      { error: "You don't own this cryptocurrency" },
      { status: 400 }
    );
  }

  const currentAmount = parseFloat(portfolio.amount);

  // Check if user has enough to sell
  if (currentAmount < amount) {
    return NextResponse.json(
      { error: `Insufficient holdings. You only have ${currentAmount} ${symbol}` },
      { status: 400 }
    );
  }

  // Get user's wallet
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    return NextResponse.json(
      { error: "Wallet not found" },
      { status: 404 }
    );
  }

  const currentBalance = parseFloat(wallet.balance);
  const newBalance = currentBalance + totalProceeds;
  const newAmount = currentAmount - amount;

  // Update wallet balance
  await db
    .update(wallets)
    .set({ 
      balance: newBalance.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(wallets.userId, userId));

  // Update or delete portfolio entry
  if (newAmount > 0.00000001) { // Keep if amount is significant
    await db
      .update(portfolios)
      .set({
        amount: newAmount.toFixed(8),
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, portfolio.id));
  } else {
    // Delete portfolio entry if sold all
    await db
      .delete(portfolios)
      .where(eq(portfolios.id, portfolio.id));
  }

  // Record transaction
  const [transaction] = await db
    .insert(transactions)
    .values({
      userId,
      type: 'SELL',
      symbol,
      coinId,
      amount: amount.toFixed(8),
      pricePerUnit: pricePerUnit.toFixed(2),
      totalValue: totalProceeds.toFixed(2),
      fee: '0',
    })
    .returning();

  return NextResponse.json({
    message: "Sell order executed successfully",
    transaction,
    newBalance: newBalance.toFixed(2),
  });
}
