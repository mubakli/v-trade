import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, portfolios } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createOrderSchema } from '@/lib/validation/trade';
import { verifyAuth } from '@/lib/middleware/auth';

// GET /api/orders - Fetch user's active orders
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all pending orders for the user
    const userOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, auth.userId),
          eq(orders.status, 'PENDING')
        )
      )
      .orderBy(orders.createdAt);

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new stop-loss or take-profit order
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify portfolio exists and belongs to user
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(
        and(
          eq(portfolios.id, validatedData.portfolioId),
          eq(portfolios.userId, auth.userId)
        )
      )
      .limit(1);

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Verify amount doesn't exceed holdings
    const portfolioAmount = parseFloat(portfolio.amount);
    if (validatedData.amount > portfolioAmount) {
      return NextResponse.json(
        { error: 'Order amount exceeds holdings' },
        { status: 400 }
      );
    }

    // Create the order
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: auth.userId,
        portfolioId: validatedData.portfolioId,
        symbol: validatedData.symbol,
        coinId: validatedData.coinId,
        orderType: validatedData.orderType,
        triggerPrice: validatedData.triggerPrice.toString(),
        amount: validatedData.amount.toString(),
        status: 'PENDING',
      })
      .returning();

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid order data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
