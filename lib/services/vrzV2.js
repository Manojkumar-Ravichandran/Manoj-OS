const isValidNumber = (value) => Number.isFinite(value);

export const detectWeeklyZones = (candles, config = { buffer: 0.01, strengthPct: 0.02 }) => {
  const zones = [];
  
  const processZone = (candle, type, i) => {
    const zoneLow = type === 'VRZ_HIGH' ? candle.high : candle.low * (1 - config.buffer);
    const zoneHigh = type === 'VRZ_HIGH' ? candle.high * (1 + config.buffer) : candle.low;

    let touches = 0;
    let currentlyInside = false;
    let invalidated = false;
    
    for (let j = i + 1; j < candles.length; j++) {
      const c = candles[j];
      const isInside = c.low <= zoneHigh && c.high >= zoneLow;
      
      if (isInside) {
        if (!currentlyInside) {
          touches++;
          currentlyInside = true;
        }
      } else {
        currentlyInside = false;
      }
      
      if (type === 'VRZ_HIGH' && c.close > zoneHigh * 1.05) invalidated = true;
      if (type === 'VRZ_LOW' && c.close < zoneLow * 0.95) invalidated = true;
    }
    
    if (!invalidated && touches <= 2) {
      zones.push({
        type,
        zoneLow,
        zoneHigh,
        zonePrice: type === 'VRZ_HIGH' ? zoneLow : zoneHigh,
        touchCount: touches,
        sourceTime: candle.time,
        sourceCandle: { ...candle }
      });
    }
  };

  for (let i = 3; i < candles.length - 3; i++) {
    const current = candles[i];
    
    const isSwingHigh = 
      current.high > candles[i-1].high && current.high > candles[i-2].high && current.high > candles[i-3].high &&
      current.high > candles[i+1].high && current.high > candles[i+2].high && current.high > candles[i+3].high;
      
    if (isSwingHigh) {
      const nextCandles = candles.slice(i + 1, i + 3);
      const maxMove = Math.max(...nextCandles.map(c => Math.abs(c.close - current.high)));
      if (maxMove >= current.high * config.strengthPct) {
        processZone(current, 'VRZ_HIGH', i);
      }
    }

    const isSwingLow = 
      current.low < candles[i-1].low && current.low < candles[i-2].low && current.low < candles[i-3].low &&
      current.low < candles[i+1].low && current.low < candles[i+2].low && current.low < candles[i+3].low;
      
    if (isSwingLow) {
      const nextCandles = candles.slice(i + 1, i + 3);
      const maxMove = Math.max(...nextCandles.map(c => Math.abs(c.close - current.low)));
      if (maxMove >= current.low * config.strengthPct) {
        processZone(current, 'VRZ_LOW', i);
      }
    }
  }
  
  return zones;
};

export const detectDailySignals = (dailyCandles, weeklyZones, config = { nearPct: 1.5, brokenThreshold: 5.0 }) => {
  if (dailyCandles.length < 3) return null;
  
  const current = dailyCandles[dailyCandles.length - 1];
  const ltp = current.close;
  const body = Math.abs(current.close - current.open);
  const range = current.high - current.low;
  const strength = range > 0 && (body / range > 0.6) ? 'strong' : 'normal';
  
  const signals = [];
  
  for (const zone of weeklyZones) {
    let signal = {
      type: 'NONE',
      vrzLevel: zone.zonePrice,
      distance: 0,
      touchCount: zone.touchCount,
      freshness: 0,
      strength: 'normal'
    };

    const dist = (Math.abs(ltp - zone.zonePrice) / zone.zonePrice) * 100;
    if (dist > config.brokenThreshold) continue;

    for (let f = 0; f <= 2; f++) {
      const idx = dailyCandles.length - 1 - f;
      if (idx < 1) continue;
      
      const c_curr = dailyCandles[idx];
      const c_prev = dailyCandles[idx - 1];
      if (!c_curr || !c_prev) continue;

      if (c_prev.close < zone.zoneLow && c_curr.close > zone.zoneLow && zone.type === 'VRZ_LOW') {
        const staysAbove = dailyCandles.slice(idx + 1).every(c => c.close > zone.zoneLow);
        if (staysAbove) {
          signal.type = 'RECLAIMED_BUY';
          signal.freshness = f;
          break;
        }
      }
      else if (c_prev.close > zone.zoneHigh && c_curr.close < zone.zoneHigh && zone.type === 'VRZ_HIGH') {
        const staysBelow = dailyCandles.slice(idx + 1).every(c => c.close < zone.zoneHigh);
        if (staysBelow) {
          signal.type = 'RECLAIMED_SELL';
          signal.freshness = f;
          break;
        }
      }
    }

    if (signal.type === 'NONE') {
      if (current.close < zone.zoneLow && zone.type === 'VRZ_LOW') {
        signal.type = 'BROKEN_LOW';
      }
      else if (current.close > zone.zoneHigh && zone.type === 'VRZ_HIGH') {
        signal.type = 'BROKEN_HIGH';
      }
      else if (dist <= config.nearPct) {
        signal.type = zone.type === 'VRZ_LOW' ? 'NEAR_LOW' : 'NEAR_HIGH';
        signal.distance = dist;
      }
    }

    if (signal.type !== 'NONE') {
      signal.strength = strength;
      signal.price = ltp;
      signals.push(signal);
    }
  }
  
  if (signals.length === 0) return null;
  
  return signals.sort((a, b) => {
    const priority = { RECLAIMED_BUY: 0, RECLAIMED_SELL: 0, BROKEN_LOW: 1, BROKEN_HIGH: 1, NEAR_LOW: 2, NEAR_HIGH: 2 };
    return priority[a.type] - priority[b.type];
  })[0];
};
