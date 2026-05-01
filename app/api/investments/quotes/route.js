import { NextResponse } from "next/server";
import { fetchQuote } from "@/lib/services/yahoo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbolsStr = searchParams.get("symbols");
  const symbols = symbolsStr ? symbolsStr.split(",").map(s => s.trim()) : [];

  try {
    const marketSymbols = ["^NSEI", "^BSESN"]; // NIFTY 50 and SENSEX
    const allSymbols = [...new Set([...marketSymbols, ...symbols])];

    const results = await Promise.all(
      allSymbols.map(async (symbol) => {
        try {
          const quote = await fetchQuote(symbol);
          return { symbol, ...quote };
        } catch (error) {
          console.error(`Failed to fetch quote for ${symbol}:`, error.message);
          return { symbol, error: error.message };
        }
      })
    );

    const quotesMap = {};
    results.forEach((res) => {
      quotesMap[res.symbol] = res;
    });

    return NextResponse.json({
      success: true,
      quotes: quotesMap,
      market: {
        nifty: quotesMap["^NSEI"],
        sensex: quotesMap["^BSESN"],
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
