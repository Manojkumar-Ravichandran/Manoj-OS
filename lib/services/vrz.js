const isValidNumber = (value) => Number.isFinite(value);

const getBodyHigh = (candle) => Math.max(candle.open, candle.close);
const getBodyLow = (candle) => Math.min(candle.open, candle.close);

const zoneWidthPct = (zoneHigh, zoneLow) => ((zoneHigh - zoneLow) / zoneLow) * 100;

const isPivotHigh = (candles, index, lookback, lookforward) => {
  const pivotHigh = candles[index].high;
  for (let i = index - lookback; i <= index + lookforward; i += 1) {
    if (i === index || i < 0 || i >= candles.length) continue;
    if (candles[i].high >= pivotHigh) return false;
  }
  return true;
};

const isPivotLow = (candles, index, lookback, lookforward) => {
  const pivotLow = candles[index].low;
  for (let i = index - lookback; i <= index + lookforward; i += 1) {
    if (i === index || i < 0 || i >= candles.length) continue;
    if (candles[i].low <= pivotLow) return false;
  }
  return true;
};

const buildZoneFromCandle = (candle, type) => {
  if (!isValidNumber(candle.open) || !isValidNumber(candle.close)) return null;

  if (type === "VRZ_HIGH") {
    const zoneLow = getBodyHigh(candle);
    const zoneHigh = candle.high;
    return {
      type,
      zoneLow,
      zoneHigh,
      zonePrice: zoneLow,
      sourceTime: candle.time,
      sourceCandle: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }
    };
  }

  const zoneLow = candle.low;
  const zoneHigh = getBodyLow(candle);
  return {
    type,
    zoneLow,
    zoneHigh,
    zonePrice: zoneHigh,
    sourceTime: candle.time,
    sourceCandle: {
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }
  };
};

export const findBreakoutInCandles = (candles, zone) => {
  for (const candle of candles) {
    if (zone.type === "VRZ_HIGH" && candle.close > zone.zoneHigh) {
      return { time: candle.time, price: candle.close };
    }
    if (zone.type === "VRZ_LOW" && candle.close < zone.zoneLow) {
      return { time: candle.time, price: candle.close };
    }
  }
  return null;
};

export const detectZones = (candles, config) => {
  const zones = [];
  const lookback = Math.max(1, config.pivotLookback);
  const lookforward = Math.max(1, config.pivotLookforward);

  for (let i = lookback; i < candles.length - lookforward; i += 1) {
    const candle = candles[i];
    if (
      !isValidNumber(candle.open) ||
      !isValidNumber(candle.close) ||
      !isValidNumber(candle.high) ||
      !isValidNumber(candle.low)
    ) {
      continue;
    }

    if (isPivotHigh(candles, i, lookback, lookforward)) {
      const zone = buildZoneFromCandle(candle, "VRZ_HIGH");
      if (zone && zoneWidthPct(zone.zoneHigh, zone.zoneLow) >= config.minZoneWidthPct) {
        const breakout = findBreakoutInCandles(candles.slice(i + 1), zone);
        if (breakout) {
          zone.isActive = false;
          zone.brokenAt = breakout.time;
          zone.breakPrice = breakout.price;
        } else {
          zone.isActive = true;
        }
        zones.push(zone);
      }
    }

    if (isPivotLow(candles, i, lookback, lookforward)) {
      const zone = buildZoneFromCandle(candle, "VRZ_LOW");
      if (zone && zoneWidthPct(zone.zoneHigh, zone.zoneLow) >= config.minZoneWidthPct) {
        const breakout = findBreakoutInCandles(candles.slice(i + 1), zone);
        if (breakout) {
          zone.isActive = false;
          zone.brokenAt = breakout.time;
          zone.breakPrice = breakout.price;
        } else {
          zone.isActive = true;
        }
        zones.push(zone);
      }
    }
  }

  return zones;
};

export const evaluateProximity = (ltp, zone, nearPct) => {
  if (!Number.isFinite(ltp)) return null;

  if (zone.type === "VRZ_HIGH") {
    if (ltp > zone.zoneHigh) return null;
    const distance = ltp >= zone.zoneLow ? 0 : zone.zoneLow - ltp;
    const distancePercent = (distance / ltp) * 100;
    if (distancePercent <= nearPct) {
      return { zonePrice: zone.zoneLow, distancePercent };
    }
    return null;
  }

  if (ltp < zone.zoneLow) return null;
  const distance = ltp <= zone.zoneHigh ? 0 : ltp - zone.zoneHigh;
  const distancePercent = (distance / ltp) * 100;
  if (distancePercent <= nearPct) {
    return { zonePrice: zone.zoneHigh, distancePercent };
  }
  return null;
};
