"use client";

import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { name: 'Apr 25', Equity: 4000, MutualFunds: 2400 },
  { name: 'May 02', Equity: 3000, MutualFunds: 1398 },
  { name: 'May 09', Equity: 2000, MutualFunds: 3800 },
  { name: 'May 16', Equity: 2780, MutualFunds: 3908 },
  { name: 'May 23', Equity: 4890, MutualFunds: 4800 },
  { name: 'May 26', Equity: 6390, MutualFunds: 5800 },
];

const holdings = [
  { stock: "INFY", fullname: "Infosys Ltd.", qty: 10, avgPrice: "₹ 1,250.00", currentPrice: "₹ 1,540.30", invested: "₹ 12,500", value: "₹ 15,403", gain: "+₹ 2,903 (23.4%)", isGain: true },
  { stock: "RELIANCE", fullname: "Reliance Industries", qty: 8, avgPrice: "₹ 2,400.00", currentPrice: "₹ 2,756.80", invested: "₹ 19,200", value: "₹ 22,054", gain: "+₹ 2,854 (14.8%)", isGain: true },
  { stock: "HDFCBANK", fullname: "HDFC Bank Ltd.", qty: 15, avgPrice: "₹ 1,420.00", currentPrice: "₹ 1,729.50", invested: "₹ 21,300", value: "₹ 25,943", gain: "+₹ 4,643 (21.8%)", isGain: true },
  { stock: "TCS", fullname: "Tata Consultancy", qty: 5, avgPrice: "₹ 3,850.00", currentPrice: "₹ 4,069.20", invested: "₹ 19,250", value: "₹ 20,346", gain: "+₹ 1,096 (5.6%)", isGain: true },
  { stock: "ICICIBANK", fullname: "ICICI Bank Ltd.", qty: 20, avgPrice: "₹ 950.00", currentPrice: "₹ 1,121.40", invested: "₹ 19,000", value: "₹ 22,428", gain: "+₹ 3,428 (18.04%)", isGain: true },
  { stock: "NIPPON ETF", fullname: "Nippon India ETF", qty: 30, avgPrice: "₹ 500.00", currentPrice: "₹ 540.20", invested: "₹ 15,000", value: "₹ 16,206", gain: "+₹ 1,206 (8.04%)", isGain: true },
];

export default function InvestmentsPage() {
  const tableData = holdings.map(h => [
    <div key={h.stock}>
      <div className="font-semibold text-text-main">{h.stock}</div>
      <div className="text-xs text-text-muted">{h.fullname}</div>
    </div>,
    h.qty, h.avgPrice, h.currentPrice, h.invested, h.value,
    <span key={h.stock + "gain"} className={`font-medium ${h.isGain ? 'text-success' : 'text-danger'}`}>{h.gain}</span>
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {['Portfolio', 'Holdings', 'Watchlist', 'Orders'].map((tab, i) => (
          <div 
            key={tab} 
            className={`pb-3 font-medium text-sm cursor-pointer ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      <Card className="flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg">Holdings <span className="text-text-muted text-sm font-normal">(6)</span></h3>
        </div>
        <Table 
          columns={['Stock', 'Qty.', 'Avg. Price', 'Current Price', 'Invested', 'Current Value', 'Gain/Loss']}
          data={tableData}
        />
      </Card>
    </div>
  );
}
