"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Eye, TrendingUp, TrendingDown } from "lucide-react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import HoldingModal from "@/components/investments/HoldingModal";
import VRZStocksTab from "@/components/investments/VRZStocksTab";
import WatchlistTab from "@/components/investments/WatchlistTab";
import { fetchHoldings, deleteHolding } from "@/lib/redux/slices/holdingSlice";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function InvestmentsPage() {
  const dispatch = useDispatch();
  const { holdings, status } = useSelector((state) => state.holding);
  const [activeTab, setActiveTab] = useState('Portfolio');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);

  // Real-time data states
  const [quotes, setQuotes] = useState({});
  const [marketData, setMarketData] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  useEffect(() => {
    dispatch(fetchHoldings());
  }, [dispatch]);

  // Fetch real-time quotes for holdings and indices
  useEffect(() => {
    const fetchRealtimeData = async () => {
      setIsLoadingQuotes(true);
      try {
        const symbols = [...new Set((holdings || []).map(h => h.symbol))].join(',');
        const response = await fetch(`/api/investments/quotes${symbols ? `?symbols=${symbols}` : ''}`);
        const data = await response.json();
        if (data.success) {
          setQuotes(data.quotes);
          setMarketData(data.market);
        }
      } catch (error) {
        console.error("Failed to fetch quotes:", error);
      } finally {
        setIsLoadingQuotes(false);
      }
    };

    fetchRealtimeData();
    // Refresh every minute
    const interval = setInterval(fetchRealtimeData, 60000);
    return () => clearInterval(interval);
  }, [holdings]);

  // Fetch historical performance data
  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await fetch('/api/investments/performance');
        const data = await response.json();
        if (data.success) {
          setPerformanceData(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch performance:", error);
      }
    };

    if (holdings.length > 0) {
      fetchPerformance();
    }
  }, [holdings]);

  const portfolioStats = useMemo(() => {
    let totalInvested = 0;
    let currentValue = 0;
    let todayGain = 0;

    (holdings || []).forEach(h => {
      const invested = h.quantity * h.avgPrice;
      totalInvested += invested;

      const quote = quotes[h.symbol.toUpperCase()] || quotes[h.symbol.toUpperCase() + ".NS"];
      if (quote && quote.ltp) {
        const current = h.quantity * quote.ltp;
        currentValue += current;

        if (quote.change) {
          todayGain += h.quantity * quote.change;
        }
      } else {
        currentValue += invested;
      }
    });

    const overallGain = currentValue - totalInvested;
    const overallGainPct = totalInvested > 0 ? (overallGain / totalInvested) * 100 : 0;
    const todayGainPct = (currentValue - todayGain) > 0 ? (todayGain / (currentValue - todayGain)) * 100 : 0;

    return { totalInvested, currentValue, overallGain, overallGainPct, todayGain, todayGainPct };
  }, [holdings, quotes]);

  const handleEdit = (holding) => {
    setEditData(holding);
    setIsModalOpen(true);
  };

  const handleView = (holding) => {
    setViewData(holding);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this holding?")) {
      dispatch(deleteHolding(id));
    }
  };

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  // Group holdings by symbol for display
  const groupedHoldings = (holdings || []).reduce((acc, h) => {
    const symbol = h.symbol.trim().toUpperCase();
    if (!acc[symbol]) {
      acc[symbol] = { ...h };
    } else {
      acc[symbol].quantity += h.quantity;
      // Weighted average calculation could go here if needed, 
      // but assuming API handles it
    }
    return acc;
  }, {});

  const tableData = Object.values(groupedHoldings).map(h => {
    const quote = quotes[h.symbol.toUpperCase()] || quotes[h.symbol.toUpperCase() + ".NS"];
    const ltp = quote?.ltp;
    const invested = h.quantity * h.avgPrice;
    const currentVal = ltp ? h.quantity * ltp : invested;
    const gainLoss = currentVal - invested;
    const gainLossPct = invested > 0 ? (gainLoss / invested) * 100 : 0;

    return [
      <div key={h._id}>
        <div className="font-semibold text-text-main">{h.symbol}</div>
        <div className="text-xs text-text-muted">{h.stockName}</div>
      </div>,
      h.quantity,
      `₹ ${Number(h.avgPrice).toLocaleString('en-IN')}`,
      ltp ? (
        <div key={h._id + "ltp"} className="font-medium">
          ₹ {ltp.toLocaleString('en-IN')}
        </div>
      ) : "₹ -",
      `₹ ${invested.toLocaleString('en-IN')}`,
      `₹ ${currentVal.toLocaleString('en-IN')}`,
      <div key={h._id + "gain"} className={`font-medium flex items-center gap-1 ${gainLoss >= 0 ? 'text-success' : 'text-danger'}`}>
        {gainLoss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        ₹ {Math.abs(gainLoss).toLocaleString('en-IN')} ({gainLossPct.toFixed(2)}%)
      </div>,
      <div className="flex gap-2" key={h._id + "actions"}>
        <button onClick={() => handleView(h)} className="p-1 hover:text-primary transition-colors" title="View Details">
          <Eye className="w-4 h-4" />
        </button>
        <button onClick={() => handleEdit(h)} className="p-1 hover:text-primary transition-colors" title="Edit">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(h._id)} className="p-1 hover:text-danger transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ];
  });

  const renderMarketIndex = (name, data) => {
    if (!data) return (
      <div>
        <div className="text-sm font-medium text-text-muted">{name}</div>
        <div className="mt-2 animate-pulse bg-border h-6 w-24 rounded"></div>
      </div>
    );

    // Calculate change if not provided directly
    // Since yahoo service might not return dayChange directly in fetchQuote, 
    // we could improve it, but let's see what we have.
    // For now, just show the LTP.
    return (
      <div>
        <div className="text-sm font-medium text-text-muted">{name}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-bold text-lg">{data.ltp?.toLocaleString('en-IN')}</span>
          <span className={`text-xs font-medium ${data.change >= 0 ? 'text-success' : 'text-danger'}`}>
            {data.change >= 0 ? '+' : ''}{data.changePercent?.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1400px] mx-auto w-full pb-12">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {['Portfolio', 'Holdings', 'Watchlist', 'Orders', 'VRZ Stocks', 'CIS Stocks'].map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-medium text-sm cursor-pointer transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {activeTab === 'Portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in duration-300">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4 divide-x divide-border">
              {renderMarketIndex("NIFTY 50", marketData?.nifty)}
              <div className="pl-4">
                {renderMarketIndex("SENSEX", marketData?.sensex)}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
              <div>
                <div className="text-xs text-text-muted mb-1">Current Value</div>
                <div className="font-bold text-lg">₹ {portfolioStats.currentValue.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Total Invested</div>
                <div className="font-bold text-lg">₹ {portfolioStats.totalInvested.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Overall Gain</div>
                <div className={`font-bold text-lg ${portfolioStats.overallGain >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₹ {Math.abs(portfolioStats.overallGain).toLocaleString('en-IN')}
                  <span className="text-xs font-normal ml-1">({portfolioStats.overallGainPct.toFixed(2)}%)</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Today's Gain</div>
                <div className={`font-bold text-lg ${portfolioStats.todayGain >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₹ {Math.abs(portfolioStats.todayGain).toLocaleString('en-IN')}
                  <span className="text-xs font-normal ml-1">({portfolioStats.todayGainPct.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Portfolio Performance</h3>
              <select className="text-sm border-border border rounded px-2 py-1 bg-surface outline-none">
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[200px] w-full">
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Portfolio Value']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="Value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted text-sm italic">
                  Not enough data for performance chart
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {(activeTab === 'Holdings' || activeTab === 'Portfolio') && (
        <Card className="flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg">
              {activeTab === 'Holdings' ? 'Your Holdings' : 'Recent Holdings'}
              <span className="text-text-muted text-sm font-normal ml-2">({holdings.length})</span>
            </h3>
            {isLoadingQuotes && <span className="text-xs text-text-muted animate-pulse">Updating prices...</span>}
          </div>
          {status === 'loading' ? (
            <div className="p-12 text-center text-text-muted">Loading holdings...</div>
          ) : (
            <Table
              columns={['Stock', 'Qty.', 'Avg. Price', 'Current Price', 'Invested', 'Current Value', 'Gain/Loss', 'Actions']}
              data={tableData}
            />
          )}
        </Card>
      )}

      {activeTab === 'VRZ Stocks' && <VRZStocksTab />}
      {activeTab === 'Watchlist' && <WatchlistTab />}

      <HoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editData}
      />

      <HoldingModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        editData={viewData}
        isViewOnly={true}
      />
    </div>
  );
}

