"use client";

import { useState, useEffect } from "react";
import { RefreshCcw, Search, TrendingUp, TrendingDown, Activity, Info, Flame, Target, Zap, AlertTriangle } from "lucide-react";
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

  const { reclaimed = [], context = [] } = data?.signals || {};
  
  const filterSignals = (signals) => {
    if (!filter) return signals;
    return signals.filter((s) => s.symbol.toUpperCase().includes(filter.toUpperCase()));
  };

  const filteredReclaimed = filterSignals(reclaimed);
  const filteredContext = filterSignals(context);

  const contextHigh = filteredContext.filter(s => s.type.includes("HIGH"));
  const contextLow = filteredContext.filter(s => s.type.includes("LOW") || s.type.includes("SUPPORT"));

  const formatNumber = (val) => 
    typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "--";

  const SignalCard = ({ signal }) => {
    const isReclaimed = signal.type.startsWith("RECLAIMED");
    const isBuy = signal.type.includes("BUY") || signal.type.includes("LOW");
    
    const typeLabels = {
      RECLAIMED_BUY: "RECLAIMED BUY",
      RECLAIMED_SELL: "RECLAIMED SELL",
      NEAR_LOW: "NEAR SUPPORT",
      NEAR_HIGH: "NEAR RESISTANCE",
      BROKEN_LOW: "BROKEN SUPPORT",
      BROKEN_HIGH: "BROKEN RESISTANCE"
    };

    return (
      <div className={`group p-4 bg-surface border rounded-xl transition-all hover:-translate-y-1 shadow-sm ${
        isReclaimed ? 'border-primary/30 ring-1 ring-primary/5 shadow-primary/5' : 'border-border hover:border-text-muted/30'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 w-fit ${
              isReclaimed ? 'bg-primary/10 text-primary' : 
              signal.type.startsWith("BROKEN") ? 'bg-danger/10 text-danger' : 'bg-text-muted/10 text-text-muted'
            }`}>
              {isReclaimed && <Flame className="w-2.5 h-2.5" />}
              {typeLabels[signal.type] || signal.type}
            </span>
            {isReclaimed && (
              <span className="text-[10px] font-medium text-text-muted">
                {signal.freshness === 0 ? "🔥 Just Reclaimed" : `${signal.freshness} bars ago`}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[10px] font-medium ${isBuy ? 'text-success' : 'text-danger'}`}>
              {signal.distance !== 0 ? `${formatNumber(signal.distance)}% Away` : 'AT LEVEL'}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <Zap className={`w-2.5 h-2.5 ${signal.strength === 'strong' ? 'text-warning fill-warning' : 'text-text-muted'}`} />
              <span className="text-[10px] font-medium text-text-muted capitalize">{signal.strength}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-main leading-tight">{signal.symbol}</h3>
            <div className="text-xs font-bold mt-1">₹{formatNumber(signal.price)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-muted mb-0.5">VRZ Level</div>
            <div className="text-xs font-bold text-text-main">₹{formatNumber(signal.vrzLevel)}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border/50 pt-3">
          <div className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-text-muted" />
            <span className="text-text-muted">Touches:</span>
            <span className="font-bold">{signal.touchCount}</span>
          </div>
          <div className="text-right flex items-center justify-end gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isReclaimed ? 'bg-primary animate-pulse' : 'bg-text-muted/30'}`}></span>
            <span className="text-text-muted">{isReclaimed ? 'Priority' : 'Context'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary bg-surface/50 backdrop-blur-sm shadow-sm">
          <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-2 uppercase tracking-wider">
            <Flame className="w-3 h-3 text-primary" /> Signals Found
          </div>
          <div className="text-2xl font-bold text-text-main">{data?.counts?.reclaimed || 0}</div>
          <div className="text-[10px] text-text-muted mt-1 font-medium">Reclaimed Buy/Sell Opportunities</div>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-text-muted bg-surface/50 backdrop-blur-sm shadow-sm">
          <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-2 uppercase tracking-wider">
            <Target className="w-3 h-3 text-text-muted" /> Active Context
          </div>
          <div className="text-2xl font-bold text-text-main">{data?.counts?.context || 0}</div>
          <div className="flex gap-3 text-[10px] text-text-muted mt-1 font-medium">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Res: {contextHigh.length}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-success/50"></span>Sup: {contextLow.length}</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success/40 bg-surface/50 backdrop-blur-sm shadow-sm">
          <div className="text-xs font-medium text-text-muted mb-1 uppercase tracking-wider font-semibold">NIFTY 50 INDEX</div>
          <div className="text-2xl font-bold text-text-main">{formatNumber(data?.index?.ltp)}</div>
          <div className="flex justify-between text-[10px] text-text-muted mt-1 font-medium">
            <span>H: {formatNumber(data?.index?.dayHigh)}</span>
            <span>L: {formatNumber(data?.index?.dayLow)}</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-danger/40 bg-surface/50 backdrop-blur-sm shadow-sm">
          <div className="text-xs font-medium text-text-muted mb-1 flex items-center gap-2 uppercase tracking-wider font-semibold">
            <Activity className="w-3 h-3 text-danger" /> INDIA VIX
          </div>
          <div className="text-2xl font-bold text-text-main">{formatNumber(data?.vix?.value)}</div>
          <div className="text-[10px] text-text-muted mt-1 font-medium italic">Market Volatility</div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by symbol (e.g. RELIANCE)..." 
            className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-text-muted flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5" />
            Last Updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Never"}
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="primary"
            className="gap-2 text-xs py-2 h-auto px-4 shadow-lg shadow-primary/20"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Scanning...' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Panels */}
      <div className="flex flex-col gap-12">
        {/* RECLAIMED Panel */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-bold flex items-center gap-3 text-text-main">
              <span className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                <Flame className="w-5 h-5 text-primary" />
              </span>
              🔥 RECLAIMED (Top Priority)
            </h2>
            <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              {filteredReclaimed.length} Opportunities
            </span>
          </div>
          
          {filteredReclaimed.length === 0 ? (
            <div className="p-12 text-center bg-surface/30 rounded-2xl border border-dashed border-border text-text-muted">
              <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No reclaim signals detected in current scan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
              {filteredReclaimed.map((signal) => (
                <SignalCard key={signal.symbol} signal={signal} />
              ))}
            </div>
          )}
        </section>

        {/* CONTEXT Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Resistance Panel */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold flex items-center gap-3 text-text-main">
                <span className="w-2 h-6 bg-primary rounded-full"></span>
                VRZ HIGH (Sell/Resistance)
              </h2>
              <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                {contextHigh.length} Stocks
              </span>
            </div>

            {contextHigh.length === 0 ? (
              <div className="p-8 text-center bg-surface/30 rounded-xl border border-dashed border-border text-text-muted text-sm italic">
                No stocks near VRZ High zone.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contextHigh.map((signal) => (
                  <SignalCard key={signal.symbol} signal={signal} />
                ))}
              </div>
            )}
          </section>

          {/* Support Panel */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold flex items-center gap-3 text-text-main">
                <span className="w-2 h-6 bg-success rounded-full"></span>
                VRZ LOW (Buy/Support)
              </h2>
              <span className="text-xs font-bold bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                {contextLow.length} Stocks
              </span>
            </div>

            {contextLow.length === 0 ? (
              <div className="p-8 text-center bg-surface/30 rounded-xl border border-dashed border-border text-text-muted text-sm italic">
                No stocks near VRZ Low zone.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contextLow.map((signal) => (
                  <SignalCard key={signal.symbol} signal={signal} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Strategy Info */}
      <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col md:flex-row gap-6 items-center">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
          <Info className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-text-main mb-1">VRZ Failed Break Strategy</h4>
          <p className="text-sm text-text-muted leading-relaxed">
            This system scans for <strong>Weekly VRZ zones</strong> (major high/low levels) and identifies <strong>Daily failed breakouts/breakdowns</strong>. 
            A "Reclaim" happens when price briefly breaks a level and immediately closes back inside, signaling a high-probability reversal opportunity.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex flex-col items-center p-3 bg-surface border border-border rounded-xl min-w-[80px]">
            <span className="text-[10px] font-bold text-text-muted uppercase">Zones</span>
            <span className="text-sm font-bold text-primary">Weekly</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-surface border border-border rounded-xl min-w-[80px]">
            <span className="text-[10px] font-bold text-text-muted uppercase">Signals</span>
            <span className="text-sm font-bold text-primary">Daily</span>
          </div>
        </div>
      </div>
    </div>
  );
}
