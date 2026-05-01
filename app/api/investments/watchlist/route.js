import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Watchlist from "@/lib/models/Watchlist";
import { fetchQuote } from "@/lib/services/yahoo";

export async function GET() {
  try {
    await dbConnect();
    const watchlist = await Watchlist.find({}).sort({ createdAt: -1 });
    
    // Enrich with live quotes
    const symbols = watchlist.map(w => w.symbol);
    const enrichedList = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const quote = await fetchQuote(item.symbol);
          return { ...item._doc, quote };
        } catch (error) {
          return { ...item._doc, quote: null };
        }
      })
    );

    return NextResponse.json({ success: true, data: enrichedList });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { symbol, name } = await request.json();
    if (!symbol) return NextResponse.json({ error: "Symbol is required" }, { status: 400 });

    const newItem = await Watchlist.create({ symbol, name });
    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Stock already in watchlist" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await Watchlist.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
