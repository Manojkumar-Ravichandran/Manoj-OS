import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Instrument from "@/lib/models/Instrument";
import Zone from "@/lib/models/Zone";
import SystemState from "@/lib/models/SystemState";
import { evaluateProximity } from "@/lib/services/vrz";
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

    const [instruments, zones, state, vix, indexQuote] = await Promise.all([
      Instrument.find({}),
      Zone.find({ isActive: true }),
      SystemState.findOne({ key: "vrz" }),
      fetchVix(),
      fetchIndex()
    ]);

    const zoneMap = new Map();
    for (const zone of zones) {
      if (!zoneMap.has(zone.symbol)) {
        zoneMap.set(zone.symbol, []);
      }
      zoneMap.get(zone.symbol).push(zone);
    }

    const results = [];
    let vrzHigh = 0;
    let vrzLow = 0;

    for (const instrument of instruments) {
      const ltp = instrument.ltp;
      const symbolZones = zoneMap.get(instrument.symbol) || [];

      let best = null;
      for (const zone of symbolZones) {
        const proximity = evaluateProximity(ltp, zone, vrzConfig.nearPct);
        if (!proximity) continue;
        const candidate = {
          symbol: instrument.symbol,
          ltp,
          nearZone: zone.type,
          zonePrice: proximity.zonePrice,
          distancePercent: proximity.distancePercent
        };
        if (!best || candidate.distancePercent < best.distancePercent) {
          best = candidate;
        }
      }

      if (best) {
        if (best.nearZone === "VRZ_HIGH") vrzHigh += 1;
        if (best.nearZone === "VRZ_LOW") vrzLow += 1;
        results.push({
          ...best,
          ltp: round(best.ltp, 4),
          zonePrice: round(best.zonePrice, 4),
          distancePercent: round(best.distancePercent, 4)
        });
      }
    }

    return NextResponse.json({
      totalInstruments: NIFTY50_SYMBOLS.length,
      vrzHigh,
      vrzLow,
      stocks: results,
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
