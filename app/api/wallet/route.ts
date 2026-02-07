import { db } from "@/lib/db";
import { wallets, users } from "@/lib/db/schema";
import { verifyAuth } from "@/lib/middleware/auth";
import { eq } from "drizzle-orm";
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

    const [result] = await db
      .select({
        wallet: wallets,
        userName: users.name,
      })
      .from(wallets)
      .innerJoin(users, eq(wallets.userId, users.id))
      .where(eq(wallets.userId, auth.userId))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      wallet: result.wallet,
      user: { name: result.userName }
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
