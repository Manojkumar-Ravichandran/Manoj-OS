"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, TrendingUp, TrendingDown, RefreshCw, ChevronRight, Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import PriceAlertModal from "./PriceAlertModal";

export default function WatchlistTab() {
  const [watchlist, setWatchlist] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchStockChart(selectedStock.symbol);
    }
  }, [selectedStock]);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/investments/watchlist");
      const data = await res.json();
      if (data.success) {
        setWatchlist(data.data);
        if (data.data.length > 0 && !selectedStock) {
          setSelectedStock(data.data[0]);
        }
      }
    } catch (error) {
      console.error("Watchlist fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockChart = async (symbol) => {
    try {
      const res = await fetch(`/api/investments/stock-chart?symbol=${symbol}`);
      const data = await res.json();
      if (data.success) {
        setChartData(data.data);
      }
    } catch (error) {
      console.error("Chart fetch failed:", error);
    }
  };

  const addToWatchlist = async () => {
    if (!searchQuery) return;
    setIsAdding(true);
    try {
      const res = await fetch("/api/investments/watchlist", {
        method: "POST",
        body: JSON.stringify({ symbol: searchQuery.toUpperCase() }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setSearchQuery("");
        fetchWatchlist();
      } else {
        alert(data.error || "Failed to add stock");
      }
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const removeFromWatchlist = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Remove from watchlist?")) return;
    try {
      const res = await fetch(`/api/investments/watchlist?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
        if (selectedStock?._id === id) setSelectedStock(null);
      }
    } catch (error) {
      console.error("Remove failed:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-160px)] animate-in fade-in duration-300">
      {/* Left Sidebar: Watchlist (Zerodha Style) */}
      <Card className="w-full lg:w-[320px] flex flex-col overflow-hidden border-border bg-surface shadow-sm">
        <div className="p-3 border-b border-border space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-text-muted">Watchlist</h3>
            <button onClick={fetchWatchlist} className="p-1 hover:bg-border rounded transition-colors text-text-muted">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search & Add Symbol"
              className="w-full pl-8 pr-10 py-1.5 text-xs bg-background border border-border rounded outline-none focus:border-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToWatchlist()}
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-text-muted" />
            <button
              onClick={addToWatchlist}
              disabled={isAdding || !searchQuery}
              className="absolute right-1.5 top-1 p-1 text-primary hover:bg-primary/10 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {watchlist.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-text-muted text-[10px] italic uppercase tracking-tighter">
              No stocks in watchlist
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {watchlist.map((item) => {
                const quote = item.quote;
                const isSelected = selectedStock?._id === item._id;
                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedStock(item)}
                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all hover:bg-primary/5 group ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm tracking-tight ${isSelected ? 'text-primary' : 'text-text-main'}`}>{item.symbol}</span>
                      <span className="text-[9px] text-text-muted uppercase font-medium">NSE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`font-bold text-xs tracking-tighter ${quote?.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                          {quote?.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || "---"}
                        </div>
                        {quote?.changePercent !== undefined && (
                          <div className={`text-[9px] font-bold flex items-center justify-end gap-0.5 ${quote.changePercent >= 0 ? 'text-success/80' : 'text-danger/80'}`}>
                            {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => removeFromWatchlist(item._id, e)}
                        className="p-1 text-text-muted hover:text-danger hover:bg-danger/10 rounded transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Right Content: Detail View (Screener Style) */}
      <Card className="flex-1 flex flex-col bg-surface border-border overflow-hidden shadow-sm">
        {selectedStock ? (
          <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="p-4 border-b border-border bg-background/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black tracking-tighter text-text-main uppercase">{selectedStock.symbol}</h2>
                    <span className="px-1 py-0.5 bg-border text-text-muted text-[8px] font-bold rounded uppercase tracking-widest">Equity</span>
                  </div>
                  <p className="text-[10px] font-semibold text-text-muted mt-0.5">{selectedStock.name || "National Stock Exchange of India"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xl font-black text-text-main">₹{selectedStock.quote?.ltp?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || "---"}</div>
                  <div className="flex items-center gap-3">
                    {selectedStock.quote?.change !== undefined && (
                      <div className={`flex items-center gap-1 text-[10px] font-bold ${selectedStock.quote.change >= 0 ? 'text-success' : 'text-danger'}`}>
                        <span>{selectedStock.quote.change >= 0 ? '+' : ''}{selectedStock.quote.change.toLocaleString('en-IN')}</span>
                        <span>({selectedStock.quote.changePercent?.toFixed(2)}%)</span>
                      </div>
                    )}
                    <button 
                      onClick={() => setIsAlertModalOpen(true)}
                      className="flex items-center gap-1.5 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
                    >
                      <Bell className="w-3 h-3" /> Set Alert
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-6">
              {/* Key Ratios - Screener Style */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 p-3 bg-background/20 rounded border border-border/40">
                <RatioBox label="Market Cap" value="₹ 15,42,100 Cr" />
                <RatioBox label="Current Price" value={`₹${selectedStock.quote?.ltp?.toLocaleString('en-IN') || "---"}`} />
                <RatioBox label="High / Low" value={`₹${selectedStock.quote?.dayHigh?.toLocaleString('en-IN') || "---"} / ₹${selectedStock.quote?.dayLow?.toLocaleString('en-IN') || "---"}`} />
                <RatioBox label="Stock P/E" value="24.5" />
                <RatioBox label="Book Value" value="₹ 452" />
                <RatioBox label="Dividend Yield" value="1.25 %" />
                <RatioBox label="ROCE" value="18.4 %" />
                <RatioBox label="ROE" value="15.2 %" />
              </div>

              {/* Performance Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[9px] text-text-muted uppercase tracking-widest">Price Chart</h4>
                  <div className="flex gap-1">
                    {['1D', '1W', '1M', '1Y'].map(r => (
                      <button key={r} className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${r === '1M' ? 'bg-primary text-white' : 'hover:bg-border text-text-muted'}`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="h-[220px] w-full bg-background/30 rounded p-2 border border-border/30 relative">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" strokeOpacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={5} />
                      <YAxis tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '9px' }}
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorSelected)" strokeWidth={1.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                  {chartData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted text-[9px] italic">
                      Loading...
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <h4 className="font-bold text-[9px] text-text-muted uppercase tracking-widest border-b border-border pb-1">Price Stats</h4>
                  <div className="space-y-1">
                    <DataRow label="Prev. Close" value={`₹${selectedStock.quote?.previousClose?.toLocaleString('en-IN') || "---"}`} />
                    <DataRow label="Open" value={`₹${selectedStock.quote?.ltp?.toLocaleString('en-IN') || "---"}`} />
                    <DataRow label="52W High" value="₹ 2,945.00" />
                    <DataRow label="52W Low" value="₹ 2,150.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-[9px] text-text-muted uppercase tracking-widest border-b border-border pb-1">Volumes</h4>
                  <div className="space-y-1">
                    <DataRow label="Volume" value={selectedStock.quote?.volume?.toLocaleString('en-IN') || "---"} />
                    <DataRow label="Avg Vol (20D)" value="1.2M" />
                    <DataRow label="Delivery %" value="45.2%" />
                    <DataRow label="Circuit" value="₹ 2,245 - 2,845" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-text-muted space-y-2 bg-background/5">
            <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
              <ChevronRight className="w-5 h-5 text-primary/30" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Select a stock</p>
          </div>
        )}
      </Card>
      {selectedStock && (
        <PriceAlertModal 
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          symbol={selectedStock.symbol}
          currentPrice={selectedStock.quote?.ltp}
        />
      )}
    </div>
  );
}

function RatioBox({ label, value }) {
  return (
    <div className="flex flex-col border-l border-border/40 pl-2 first:border-0 first:pl-0">
      <span className="text-[9px] text-text-muted font-bold uppercase tracking-tighter mb-0.5">{label}</span>
      <span className="text-xs font-black text-primary tracking-tight">{value}</span>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/10 last:border-0">
      <span className="text-[10px] text-text-muted font-medium">{label}</span>
      <span className="text-[10px] font-bold text-text-main">{value}</span>
    </div>
  );
}
