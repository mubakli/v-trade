import { getTopCryptos } from "@/lib/services/crypto-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cryptos = await getTopCryptos(50);
    return NextResponse.json({ cryptos });
  } catch (error) {
    console.error("Error fetching cryptos:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency data" },
      { status: 500 }
    );
  }
}
