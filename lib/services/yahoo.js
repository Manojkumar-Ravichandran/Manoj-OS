const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36";

export const toYahooSymbol = (symbol) => {
  if (symbol.startsWith("^")) {
    return encodeURIComponent(symbol);
  }
  const normalized = symbol.includes(".") ? symbol : `${symbol}.NS`;
  return encodeURIComponent(normalized);
};

export const fetchChart = async (symbol, { interval = "30m", range = "10d" } = {}) => {
  const yahooSymbol = toYahooSymbol(symbol);
  const url = `${BASE_URL}${yahooSymbol}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`;

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT }
  });

  if (!response.ok) {
    throw new Error(`Yahoo chart error for ${symbol}: HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data?.chart?.result?.[0]) {
    const error = data?.chart?.error?.description || "No chart data";
    throw new Error(`Yahoo chart error for ${symbol}: ${error}`);
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0];
  const candles = [];

  if (quote) {
    for (let i = 0; i < timestamps.length; i += 1) {
      const candle = {
        time: new Date(timestamps[i] * 1000),
        open: quote.open?.[i],
        high: quote.high?.[i],
        low: quote.low?.[i],
        close: quote.close?.[i],
        volume: quote.volume?.[i]
      };

      if (
        Number.isFinite(candle.open) &&
        Number.isFinite(candle.high) &&
        Number.isFinite(candle.low) &&
        Number.isFinite(candle.close)
      ) {
        candles.push(candle);
      }
    }
  }

  const ltp =
    result.meta?.regularMarketPrice ??
    (candles.length > 0 ? candles[candles.length - 1].close : null);

  return { candles, ltp, meta: result.meta };
};

export const fetchQuote = async (symbol) => {
  const { ltp, meta, candles } = await fetchChart(symbol, { interval: "1m", range: "1d" });
  const highs = candles.map((candle) => candle.high).filter((value) => Number.isFinite(value));
  const lows = candles.map((candle) => candle.low).filter((value) => Number.isFinite(value));
  const fallbackHigh = highs.length ? Math.max(...highs) : null;
  const fallbackLow = lows.length ? Math.min(...lows) : null;

  const dayHigh = meta?.regularMarketDayHigh ?? fallbackHigh;
  const dayLow = meta?.regularMarketDayLow ?? fallbackLow;
  const previousClose = meta?.chartPreviousClose ?? meta?.previousClose;

  const change = ltp && previousClose ? ltp - previousClose : null;
  const changePercent = ltp && previousClose ? (change / previousClose) * 100 : null;

  const lastUpdated = meta?.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000)
    : new Date();
  return { ltp, lastUpdated, dayHigh, dayLow, previousClose, change, changePercent };
};

const NSE_HOME = "https://www.nseindia.com";
const NSE_ALL_INDICES = "https://www.nseindia.com/api/allIndices";
let nseSessionCookie = "";

/**
 * Fetches the Nifty 50 P/E ratio from NSE's allIndices API.
 * NSE requires a session cookie obtained from the homepage.
 */
export const fetchNiftyPE = async () => {
  try {
    // Refresh session cookie if not set
    if (!nseSessionCookie) {
      const homeRes = await fetch(NSE_HOME, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });
      const raw = homeRes.headers.get("set-cookie") || "";
      nseSessionCookie = raw.split(",").map((c) => c.split(";")[0]).join("; ");
    }

    const res = await fetch(NSE_ALL_INDICES, {
      headers: {
        "User-Agent": USER_AGENT,
        "Cookie": nseSessionCookie,
        "Referer": NSE_HOME,
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      // Cookie may have expired — reset and give up for this cycle
      nseSessionCookie = "";
      return null;
    }

    const data = await res.json();
    const nifty = data?.data?.find((x) => x.index === "NIFTY 50");
    const pe = parseFloat(nifty?.pe);
    return Number.isFinite(pe) && pe > 0 ? pe : null;
  } catch (err) {
    console.error("[nse] fetchNiftyPE failed:", err.message);
    return null;
  }
};
