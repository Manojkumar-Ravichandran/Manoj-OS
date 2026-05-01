"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Search, TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function VRZStocksTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vrz");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch VRZ data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/vrz", { method: "POST" });
      await fetchData();
    } catch (err) {
      console.error("Failed to refresh VRZ data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-text-muted animate-pulse">
        <Activity className="w-12 h-12 mb-4 animate-spin" />
        <p className="text-lg font-medium">Loading VRZ Analysis...</p>
      </div>
    );
  }

  const stocks = data?.stocks || [];
  const filtered = filter
    ? stocks.filter((s) => s.symbol.toUpperCase().includes(filter.toUpperCase()))
    : stocks;

  const highs = filtered.filter((s) => s.nearZone === "VRZ_HIGH");
  const lows = filtered.filter((s) => s.nearZone === "VRZ_LOW");

  const formatNumber = (val) => 
    typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "--";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary/50 bg-surface/50 backdrop-blur-sm">
          <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-primary" /> VRZ HIGH STOCKS
          </div>
          <div className="text-2xl font-bold text-text-main">{data?.vrzHigh || 0}</div>
          <div className="text-[10px] text-text-muted mt-1">Near Resistance Zone</div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-success/50 bg-surface/50 backdrop-blur-sm">
          <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-2">
            <TrendingDown className="w-3 h-3 text-success" /> VRZ LOW STOCKS
          </div>
          <div className="text-2xl font-bold text-text-main">{data?.vrzLow || 0}</div>
          <div className="text-[10px] text-text-muted mt-1">Near Support Zone</div>
        </Card>

        <Card className="p-4 border-l-4 border-l-text-muted bg-surface/50 backdrop-blur-sm">
          <div className="text-xs font-medium text-text-muted mb-1">NIFTY 50 INDEX</div>
          <div className="text-2xl font-bold text-text-main">{formatNumber(data?.index?.ltp)}</div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>H: {formatNumber(data?.index?.dayHigh)}</span>
            <span>L: {formatNumber(data?.index?.dayLow)}</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-danger/50 bg-surface/50 backdrop-blur-sm">
          <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-2">
            <Activity className="w-3 h-3 text-danger" /> INDIA VIX
          </div>
          <div className="text-2xl font-bold text-text-main">{formatNumber(data?.vix?.value)}</div>
          <div className="text-[10px] text-text-muted mt-1">Volatility Index</div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Filter by symbol..." 
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-text-muted flex items-center gap-1">
            <Info className="w-3 h-3" />
            Last Updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Never"}
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            className="gap-2 text-xs py-1.5 h-auto"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* VRZ High Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              VRZ HIGH (Sell/Resistance)
            </h2>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {highs.length} Stocks
            </span>
          </div>
          
          {highs.length === 0 ? (
            <div className="p-8 text-center bg-surface/30 rounded-xl border border-dashed border-border text-text-muted text-sm">
              No stocks near VRZ High zone.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highs.map((stock) => (
                <div key={stock.symbol} className="group p-4 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all hover:-translate-y-1 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">VRZ HIGH</span>
                    <span className="text-xs font-medium text-text-muted">{formatNumber(stock.distancePercent)}% Away</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-4">{stock.symbol}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-3">
                    <div>
                      <div className="text-text-muted mb-0.5">LTP</div>
                      <div className="font-bold">₹{formatNumber(stock.ltp)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-text-muted mb-0.5">Zone Price</div>
                      <div className="font-bold">₹{formatNumber(stock.zonePrice)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VRZ Low Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-2 h-6 bg-success rounded-full"></span>
              VRZ LOW (Buy/Support)
            </h2>
            <span className="text-xs font-medium bg-success/10 text-success px-2 py-0.5 rounded-full">
              {lows.length} Stocks
            </span>
          </div>

          {lows.length === 0 ? (
            <div className="p-8 text-center bg-surface/30 rounded-xl border border-dashed border-border text-text-muted text-sm">
              No stocks near VRZ Low zone.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lows.map((stock) => (
                <div key={stock.symbol} className="group p-4 bg-surface border border-border rounded-xl hover:border-success/50 transition-all hover:-translate-y-1 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-success/10 text-success uppercase">VRZ LOW</span>
                    <span className="text-xs font-medium text-text-muted">{formatNumber(stock.distancePercent)}% Away</span>
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-4">{stock.symbol}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-3">
                    <div>
                      <div className="text-text-muted mb-0.5">LTP</div>
                      <div className="font-bold">₹{formatNumber(stock.ltp)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-text-muted mb-0.5">Zone Price</div>
                      <div className="font-bold">₹{formatNumber(stock.zonePrice)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
