"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import HoldingModal from "@/components/investments/HoldingModal";
import VRZStocksTab from "@/components/investments/VRZStocksTab";
import { fetchHoldings, deleteHolding } from "@/lib/redux/slices/holdingSlice";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { name: 'Apr 25', Equity: 4000, MutualFunds: 2400 },
  { name: 'May 02', Equity: 3000, MutualFunds: 1398 },
  { name: 'May 09', Equity: 2000, MutualFunds: 3800 },
  { name: 'May 16', Equity: 2780, MutualFunds: 3908 },
  { name: 'May 23', Equity: 4890, MutualFunds: 4800 },
  { name: 'May 26', Equity: 6390, MutualFunds: 5800 },
];

export default function InvestmentsPage() {
  const dispatch = useDispatch();
  const { holdings, status } = useSelector((state) => state.holding);
  const [activeTab, setActiveTab] = useState('Portfolio');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    dispatch(fetchHoldings());
  }, [dispatch]);

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
      // If duplicate exists, we sum them for display (though API should handle this now)
      acc[symbol].quantity += h.quantity;
      // Note: We don't average price here as the API now does it correctly
    }
    return acc;
  }, {});

  const tableData = Object.values(groupedHoldings).map(h => [
    <div key={h._id}>
      <div className="font-semibold text-text-main">{h.symbol}</div>
      <div className="text-xs text-text-muted">{h.stockName}</div>
    </div>,
    h.quantity,
    `₹ ${Number(h.avgPrice).toLocaleString('en-IN')}`,
    "₹ -", // Current price would normally come from an API
    `₹ ${(h.quantity * h.avgPrice).toLocaleString('en-IN')}`,
    "₹ -", // Current value
    <span key={h._id + "gain"} className="text-text-muted font-medium">-</span>,
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
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
        {activeTab === 'Holdings' && (
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Add Holding
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {['Portfolio', 'Holdings', 'Watchlist', 'Orders','VRZ Stocks','CIS Stocks'].map((tab) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4 divide-x divide-border">
              <div>
                <div className="text-sm font-medium text-text-muted">Market Overview</div>
                <div className="mt-2">
                  <span className="font-bold">NIFTY</span>
                  <span className="ml-2 text-sm">24,833.60</span>
                  <span className="ml-2 text-xs text-success">+0.75%</span>
                </div>
              </div>
              <div className="pl-4">
                <div className="text-sm font-medium text-text-muted">&nbsp;</div>
                <div className="mt-2">
                  <span className="font-bold">SENSEX</span>
                  <span className="ml-2 text-sm">81,330.56</span>
                  <span className="ml-2 text-xs text-success">+0.68%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
               <div>
                  <div className="text-xs text-text-muted mb-1">Current Value</div>
                  <div className="font-bold text-lg">₹ 4,85,700</div>
               </div>
               <div>
                  <div className="text-xs text-text-muted mb-1">Total Invested</div>
                  <div className="font-bold text-lg">₹ 4,20,000</div>
               </div>
               <div>
                  <div className="text-xs text-text-muted mb-1">Overall Gain</div>
                  <div className="font-bold text-lg text-success">₹ 65,700 <span className="text-xs font-normal">(15.64%)</span></div>
               </div>
               <div>
                  <div className="text-xs text-text-muted mb-1">Today's Gain</div>
                  <div className="font-bold text-lg text-success">₹ 2,450 <span className="text-xs font-normal">(0.5%)</span></div>
               </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg">Portfolio Performance</h3>
               <select className="text-sm border-border border rounded px-2 py-1 bg-surface outline-none">
                <option>This Month</option>
              </select>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={10} tickFormatter={(val) => `${val/1000}L`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Equity" stroke="#10b981" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
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

