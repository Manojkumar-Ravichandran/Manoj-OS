import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Instrument from "@/lib/models/Instrument";
import Zone from "@/lib/models/Zone";
import SystemState from "@/lib/models/SystemState";
import Signal from "@/lib/models/Signal";
import { fetchQuote } from "@/lib/services/yahoo";
import { runOnce } from "@/lib/services/scheduler";
import vrzConfig from "@/lib/vrzConfig";
import { NIFTY50_SYMBOLS } from "@/lib/data/nifty50";

const round = (value, decimals = 4) =>
  Number.isFinite(value) ? Number.parseFloat(value.toFixed(decimals)) : value;

// In-memory cache for VIX and Index to avoid excessive Yahoo calls
let vixCache = { value: null, lastUpdated: null, fetchedAt: 0 };
let indexCache = { ltp: null, dayHigh: null, dayLow: null, lastUpdated: null, fetchedAt: 0 };
const VIX_CACHE_TTL = 60_000;
const INDEX_CACHE_TTL = 60_000;

const fetchVix = async () => {
  const now = Date.now();
  if (vixCache.value && now - vixCache.fetchedAt < VIX_CACHE_TTL) {
    return vixCache;
  }
  try {
    const { ltp, lastUpdated } = await fetchQuote(vrzConfig.vixSymbol);
    vixCache = { value: ltp, lastUpdated, fetchedAt: now };
  } catch (error) {
    console.error("[vrz] VIX fetch failed:", error.message);
  }
  return vixCache;
};

const fetchIndex = async () => {
  const now = Date.now();
  if (indexCache.ltp && now - indexCache.fetchedAt < INDEX_CACHE_TTL) {
    return indexCache;
  }
  try {
    const { ltp, lastUpdated, dayHigh, dayLow } = await fetchQuote(vrzConfig.indexSymbol);
    indexCache = { ltp, dayHigh, dayLow, lastUpdated, fetchedAt: now };
  } catch (error) {
    console.error("[vrz] Index fetch failed:", error.message);
  }
  return indexCache;
};

export async function GET() {
  try {
    await dbConnect();

    const [signals, state, vix, indexQuote] = await Promise.all([
      Signal.find({ isActive: true }).sort({ timestamp: -1 }),
      SystemState.findOne({ key: "vrz" }),
      fetchVix(),
      fetchIndex()
    ]);
    
    // Market hours check (9 AM - 4 PM IST, Monday - Friday)
    const istTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const istHours = istTime.getHours();
    const istDay = istTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const isMarketHours = istHours >= 9 && istHours < 16 && istDay >= 1 && istDay <= 5;
    
    const lastUpdate = state?.lastUpdated || state?.lastRunAt || 0;
    const oneHourAgo = Date.now() - 3600000;
    
    const needsRefresh = signals.length === 0 || (isMarketHours && new Date(lastUpdate).getTime() < oneHourAgo);

    if (needsRefresh) {
      const isInitial = signals.length === 0 && !state;
      console.log(`[vrz] Triggering ${isInitial ? "initial" : "hourly market"} refresh...`);
      runOnce().catch(err => console.error("[vrz] Auto-refresh failed:", err));
    }

    const reclaimed = signals.filter(s => s.type.startsWith("RECLAIMED"));
    const context = signals.filter(s => !s.type.startsWith("RECLAIMED"));

    return NextResponse.json({
      totalInstruments: NIFTY50_SYMBOLS.length,
      signals: {
        reclaimed,
        context
      },
      counts: {
        reclaimed: reclaimed.length,
        context: context.length
      },
      index: {
        symbol: "NIFTY 50",
        ltp: round(indexQuote?.ltp, 4),
        dayHigh: round(indexQuote?.dayHigh, 4),
        dayLow: round(indexQuote?.dayLow, 4),
        lastUpdated: indexQuote?.lastUpdated || null
      },
      vix: {
        symbol: "INDIAVIX",
        value: round(vix?.value, 4),
        lastUpdated: vix?.lastUpdated || null
      },
      lastUpdated: state?.lastUpdated || state?.lastRunAt || null
    });
  } catch (error) {
    console.error("[vrz] /api/vrz failed:", error.message);
    return NextResponse.json({ error: "Failed to load VRZ data" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await dbConnect();
    await runOnce();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[vrz] POST /api/vrz failed:", error.message);
    return NextResponse.json({ error: "Failed to refresh VRZ data" }, { status: 500 });
  }
}
