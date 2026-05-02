import vrzConfig from "@/lib/vrzConfig";
import { NIFTY50_SYMBOLS } from "@/lib/data/nifty50";
import Zone from "@/lib/models/Zone";
import Instrument from "@/lib/models/Instrument";
import SystemState from "@/lib/models/SystemState";
import { fetchChart } from "./yahoo";


import { detectWeeklyZones, detectDailySignals } from "./vrzV2";
import Signal from "@/lib/models/Signal";
import Alert from "@/lib/models/Alert";

const processSymbol = async (symbol) => {
  try {
    // 1. Weekly Analysis (for VRZ detection)
    const { candles: weeklyCandles } = await fetchChart(symbol, {
      interval: "1wk",
      range: "2y" // Get enough history for weekly pivots
    });

    if (weeklyCandles.length < 10) return;

    const weeklyZones = detectWeeklyZones(weeklyCandles);
    
    // Save weekly zones
    for (const zone of weeklyZones) {
      await Zone.updateOne(
        { symbol, timeframe: "weekly", sourceTime: zone.sourceTime, type: zone.type },
        { $set: { ...zone, timeframe: "weekly", isActive: true } },
        { upsert: true }
      );
    }

    // 2. Daily Analysis (for Signals)
    const { candles: dailyCandles, ltp } = await fetchChart(symbol, {
      interval: "1d",
      range: "1mo"
    });

    if (dailyCandles.length < 5 || !Number.isFinite(ltp)) return;

    // Fetch active weekly zones from DB for signal checking
    const dbWeeklyZones = await Zone.find({ symbol, timeframe: "weekly", isActive: true });
    
    const signal = detectDailySignals(dailyCandles, dbWeeklyZones);

    if (signal) {
      const existingSignal = await Signal.findOne({ symbol });
      const isNewReclaim = signal.type.startsWith("RECLAIMED") && 
                          (!existingSignal || existingSignal.type !== signal.type || existingSignal.vrzLevel !== signal.vrzLevel);

      await Signal.updateOne(
        { symbol },
        { $set: { ...signal, isActive: true, timestamp: new Date() } },
        { upsert: true }
      );

      if (isNewReclaim) {
        await Alert.create({
          title: `${symbol} - VRZ Reclaimed (${signal.type.includes("BUY") ? "BUY" : "SELL"})`,
          subtitle: `Price reclaimed level ${signal.vrzLevel.toLocaleString()} with ${signal.strength} strength.`,
          category: "Market",
          symbol: symbol,
          priority: "High",
          dueDate: new Date(),
          status: "Active"
        });
      }
    } else {
      await Signal.deleteOne({ symbol });
    }

    // Update Instrument LTP
    await Instrument.updateOne(
      { symbol },
      { $set: { ltp, lastUpdated: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.error(`[vrz] ${symbol} failed:`, error.message);
  }
};

export const runOnce = async () => {
  const startedAt = new Date();
  await SystemState.updateOne(
    { key: "vrz" },
    { $set: { lastRunAt: startedAt, lastError: null } },
    { upsert: true }
  );

  const batchSize = 3; // Smaller batch size due to multiple timeframe fetches
  for (let i = 0; i < NIFTY50_SYMBOLS.length; i += batchSize) {
    const batch = NIFTY50_SYMBOLS.slice(i, i + batchSize);
    await Promise.all(batch.map(symbol => processSymbol(symbol)));
    // Add delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await SystemState.updateOne(
    { key: "vrz" },
    { $set: { lastUpdated: new Date() } },
    { upsert: true }
  );
};
