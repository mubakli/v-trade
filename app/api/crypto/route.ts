import { getTopCryptos, searchCrypto } from "@/lib/services/crypto-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    let cryptos;
    if (query) {
      cryptos = await searchCrypto(query);
    } else {
      cryptos = await getTopCryptos(50);
    }

    return NextResponse.json({ cryptos });
  } catch (error) {
    console.error("Error fetching cryptos:", error);
    return NextResponse.json(
      { error: "Failed to fetch cryptocurrency data" },
      { status: 500 }
    );
  }
}
