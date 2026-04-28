import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Holding from "@/lib/models/Holding";

export async function GET() {
  try {
    await dbConnect();
    const holdings = await Holding.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: holdings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { symbol, stockName, quantity, avgPrice, date, broker, chartAnalysis, notes, pe } = body;
    const cleanSymbol = symbol.trim().toUpperCase();

    const qty = Number(quantity);
    const price = Number(avgPrice);

    // Check if stock already exists in holdings
    let holding = await Holding.findOne({ symbol: cleanSymbol });

    if (holding) {
      // Update existing holding: Weighted Average Price Calculation
      const totalQty = holding.quantity + qty;
      const totalCost = (holding.quantity * holding.avgPrice) + (qty * price);
      const newAvgPrice = totalCost / totalQty;

      holding.quantity = totalQty;
      holding.avgPrice = newAvgPrice;
      holding.stockName = stockName;
      if (chartAnalysis) holding.chartAnalysis = chartAnalysis;
      if (notes) holding.notes = notes;
      if (pe) holding.pe = pe;
      
      // Add to history
      holding.history.push({ date, quantity: qty, price, broker, pe: Number(pe || 0) });
      
      await holding.save();
      return NextResponse.json({ success: true, data: holding });
    } else {
      // Create new holding
      const newHolding = await Holding.create({
        ...body,
        symbol: cleanSymbol,
        history: [{ date, quantity: qty, price, broker, pe: Number(pe || 0) }]
      });
      return NextResponse.json({ success: true, data: newHolding }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
