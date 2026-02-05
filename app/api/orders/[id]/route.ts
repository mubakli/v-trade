import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuth } from '@/lib/middleware/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;

    // Find and verify order belongs to user
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, auth.userId),
          eq(orders.status, 'PENDING')
        )
      )
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or already executed' },
        { status: 404 }
      );
    }

    // Update order status to CANCELLED
    await db
      .update(orders)
      .set({ status: 'CANCELLED' })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
