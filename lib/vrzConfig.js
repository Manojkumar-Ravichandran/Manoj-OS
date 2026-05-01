const vrzConfig = {
  concurrency: Number.parseInt(process.env.FETCH_CONCURRENCY || "5", 10),
  candleInterval: "30m",
  candleRangeInitial: process.env.CANDLE_RANGE_INITIAL || "60d",
  candleRangeRegular: process.env.CANDLE_RANGE_REGULAR || "10d",
  vixSymbol: process.env.VIX_SYMBOL || "^INDIAVIX",
  indexSymbol: process.env.INDEX_SYMBOL || "^NSEI",
  pivotLookback: Number.parseInt(process.env.PIVOT_LOOKBACK || "3", 10),
  pivotLookforward: Number.parseInt(process.env.PIVOT_LOOKFORWARD || "3", 10),
  minZoneWidthPct: Number.parseFloat(process.env.MIN_ZONE_WIDTH_PCT || "0.05"),
  nearPct: Number.parseFloat(process.env.NEAR_PCT || "0.4")
};

export default vrzConfig;
