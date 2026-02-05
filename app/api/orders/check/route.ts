import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, portfolios, transactions, wallets } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuth } from '@/lib/middleware/auth';

// POST /api/orders/check - Check and execute triggered orders
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prices } = await request.json();
    
    if (!prices || typeof prices !== 'object') {
      return NextResponse.json(
        { error: 'Invalid prices data' },
        { status: 400 }
      );
    }

    // Fetch all pending orders for the user
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, auth.userId),
          eq(orders.status, 'PENDING')
        )
      );

    const executedOrders = [];

    // Check each order against current prices
    for (const order of pendingOrders) {
      const currentPrice = prices[order.coinId];
      
      if (!currentPrice) continue;

      const triggerPrice = parseFloat(order.triggerPrice);
      let shouldExecute = false;

      // Check if order should be executed
      if (order.orderType === 'STOP_LOSS' && currentPrice <= triggerPrice) {
        shouldExecute = true;
      } else if (order.orderType === 'TAKE_PROFIT' && currentPrice >= triggerPrice) {
        shouldExecute = true;
      }

      if (shouldExecute) {
        try {
          // Execute the sell order
          await executeSellOrder(auth.userId, order, currentPrice);
          executedOrders.push(order);
        } catch (error) {
          console.error(`Failed to execute order ${order.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: `Checked ${pendingOrders.length} orders, executed ${executedOrders.length}`,
      executedOrders,
    });
  } catch (error) {
    console.error('Error checking orders:', error);
    return NextResponse.json(
      { error: 'Failed to check orders' },
      { status: 500 }
    );
  }
}

async function executeSellOrder(userId: string, order: any, currentPrice: number) {
  const amount = parseFloat(order.amount);
  const totalValue = amount * currentPrice;

  // Get user's wallet
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // Get portfolio
  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.id, order.portfolioId))
    .limit(1);

  if (!portfolio) {
    throw new Error('Portfolio not found');
  }

  // Start transaction
  const portfolioAmount = parseFloat(portfolio.amount);
  const newAmount = portfolioAmount - amount;

  // Update or delete portfolio
  if (newAmount <= 0.00000001) {
    await db.delete(portfolios).where(eq(portfolios.id, order.portfolioId));
  } else {
    await db
      .update(portfolios)
      .set({
        amount: newAmount.toString(),
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, order.portfolioId));
  }

  // Update wallet balance
  const newBalance = parseFloat(wallet.balance) + totalValue;
  await db
    .update(wallets)
    .set({
      balance: newBalance.toString(),
      updatedAt: new Date(),
    })
    .where(eq(wallets.id, wallet.id));

  // Create transaction record
  await db.insert(transactions).values({
    userId,
    type: 'SELL',
    symbol: order.symbol,
    coinId: order.coinId,
    amount: amount.toString(),
    pricePerUnit: currentPrice.toString(),
    totalValue: totalValue.toString(),
    fee: '0',
  });

  // Mark order as executed
  await db
    .update(orders)
    .set({
      status: 'EXECUTED',
      executedAt: new Date(),
    })
    .where(eq(orders.id, order.id));
}
