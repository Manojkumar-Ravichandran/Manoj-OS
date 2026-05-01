import { NextResponse } from "next/server";
import { fetchChart } from "@/lib/services/yahoo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") || "1mo";
  const interval = searchParams.get("interval") || "1d";

  if (!symbol) return NextResponse.json({ error: "Symbol is required" }, { status: 400 });

  try {
    const { candles } = await fetchChart(symbol, { interval, range });
    const formattedData = candles.map(c => ({
      name: c.time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      value: c.close,
      fullDate: c.time
    }));

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
