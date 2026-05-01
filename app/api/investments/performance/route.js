import { NextResponse } from "next/server";
import { fetchChart } from "@/lib/services/yahoo";
import dbConnect from "@/lib/mongodb";
import Holding from "@/lib/models/Holding";

export async function GET() {
  try {
    await dbConnect();
    const holdings = await Holding.find({});
    
    if (holdings.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Group holdings by symbol to avoid duplicate fetches
    const symbols = [...new Set(holdings.map(h => h.symbol))];
    
    // Fetch 1-month chart for each symbol
    const charts = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          // Using 1d interval for a month's range
          const { candles } = await fetchChart(symbol, { interval: "1d", range: "1mo" });
          return { symbol, candles };
        } catch (error) {
          console.error(`Failed to fetch chart for ${symbol}:`, error.message);
          return { symbol, candles: [] };
        }
      })
    );

    // Aggregate data by date
    // We want to show the total portfolio value over time
    const performanceDataMap = {};
    
    charts.forEach(({ symbol, candles }) => {
      const symbolHoldings = holdings.filter(h => h.symbol === symbol);
      const totalQty = symbolHoldings.reduce((sum, h) => sum + h.quantity, 0);
      
      candles.forEach(candle => {
        // Use a simple date format for the X-axis
        const dateObj = new Date(candle.time);
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const sortKey = dateObj.toISOString().split('T')[0];
        
        if (!performanceDataMap[sortKey]) {
          performanceDataMap[sortKey] = { 
            sortKey,
            name: dateStr, 
            value: 0 
          };
        }
        performanceDataMap[sortKey].value += candle.close * totalQty;
      });
    });

    // Sort by date and format for Recharts
    const performanceData = Object.values(performanceDataMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(item => ({
        name: item.name,
        Value: Math.round(item.value)
      }));

    return NextResponse.json({ success: true, data: performanceData });
  } catch (error) {
    console.error("[performance] API failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
