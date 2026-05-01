import vrzConfig from "@/lib/vrzConfig";
import { NIFTY50_SYMBOLS } from "@/lib/data/nifty50";
import Zone from "@/lib/models/Zone";
import Instrument from "@/lib/models/Instrument";
import SystemState from "@/lib/models/SystemState";
import { fetchChart } from "./yahoo";
import { detectZones, findBreakoutInCandles } from "./vrz";

const upsertZone = async (symbol, zone) => {
  const base = {
    symbol,
    type: zone.type,
    timeframe: "30m",
    zoneHigh: zone.zoneHigh,
    zoneLow: zone.zoneLow,
    zonePrice: zone.zonePrice,
    sourceTime: zone.sourceTime,
    sourceCandle: zone.sourceCandle
  };

  await Zone.updateOne(
    { symbol, type: zone.type, sourceTime: zone.sourceTime },
    { $setOnInsert: base },
    { upsert: true }
  );

  if (zone.isActive === false) {
    await Zone.updateOne(
      { symbol, type: zone.type, sourceTime: zone.sourceTime },
      { $set: { isActive: false, brokenAt: zone.brokenAt, breakPrice: zone.breakPrice } }
    );
  }
};

const invalidateZones = async (symbol, ltp, newCandles, latestCandleTime) => {
  const activeZones = await Zone.find({ symbol, isActive: true });
  for (const zone of activeZones) {
    const ltpBreak =
      (zone.type === "VRZ_HIGH" && ltp > zone.zoneHigh) ||
      (zone.type === "VRZ_LOW" && ltp < zone.zoneLow);

    const breakout = !ltpBreak && newCandles.length > 0 ? findBreakoutInCandles(newCandles, zone) : null;

    if (ltpBreak || breakout) {
      const brokenAt = breakout?.time || new Date();
      const breakPrice = breakout?.price || ltp;
      await Zone.updateOne(
        { _id: zone._id },
        { $set: { isActive: false, brokenAt, breakPrice } }
      );
    } else {
      await Zone.updateOne(
        { _id: zone._id },
        { $set: { lastCheckedAt: latestCandleTime } }
      );
    }
  }
};

const processSymbol = async (symbol) => {
  const instrument = await Instrument.findOne({ symbol });
  const range = instrument ? vrzConfig.candleRangeRegular : vrzConfig.candleRangeInitial;

  const { candles, ltp, meta } = await fetchChart(symbol, {
    interval: vrzConfig.candleInterval,
    range
  });

  if (!candles.length || !Number.isFinite(ltp)) {
    return;
  }

  const zones = detectZones(candles, vrzConfig);
  for (const zone of zones) {
    await upsertZone(symbol, zone);
  }

  const latestCandleTime = candles[candles.length - 1].time;
  const newCandles = instrument?.lastCandleTime
    ? candles.filter((candle) => candle.time > instrument.lastCandleTime)
    : candles;

  await invalidateZones(symbol, ltp, newCandles, latestCandleTime);

  const lastUpdated = meta?.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000)
    : new Date();

  await Instrument.updateOne(
    { symbol },
    { $set: { ltp, lastUpdated, lastCandleTime: latestCandleTime } },
    { upsert: true }
  );
};

export const runOnce = async () => {
  const startedAt = new Date();
  await SystemState.updateOne(
    { key: "vrz" },
    { $set: { lastRunAt: startedAt, lastError: null } },
    { upsert: true }
  );

  // Process in small batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < NIFTY50_SYMBOLS.length; i += batchSize) {
    const batch = NIFTY50_SYMBOLS.slice(i, i + batchSize);
    await Promise.all(batch.map(symbol => 
      processSymbol(symbol).catch(err => console.error(`[vrz] ${symbol} failed:`, err.message))
    ));
    // Optional: add a small delay between batches if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
  }

  await SystemState.updateOne(
    { key: "vrz" },
    { $set: { lastUpdated: new Date() } },
    { upsert: true }
  );
};
