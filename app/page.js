"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CalendarDays,
  MoreHorizontal
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const cashFlowData = [
  { name: '26 Apr', income: 40000, expenses: 24000 },
  { name: '3 May', income: 30000, expenses: 13980 },
  { name: '10 May', income: 20000, expenses: 9800 },
  { name: '17 May', income: 27800, expenses: 3908 },
  { name: '24 May', income: 18900, expenses: 4800 },
  { name: '31 May', income: 23900, expenses: 3800 },
];

const expenseData = [
  { name: 'Food & Dining', value: 16450, color: '#3b82f6' },
  { name: 'Transport', value: 12600, color: '#10b981' },
  { name: 'Shopping', value: 9850, color: '#f59e0b' },
  { name: 'Bills & Utilities', value: 8900, color: '#ef4444' },
  { name: 'Entertainment', value: 6500, color: '#8b5cf6' },
  { name: 'Others', value: 13940, color: '#6366f1' },
];

const recentTransactions = [
  { id: 1, title: 'Grocery Shopping', time: 'Today, 10:30 AM', amount: '- ₹ 1,250', type: 'expense', icon: '🛒', color: 'bg-orange-100' },
  { id: 2, title: 'Freelance Project', time: 'Today, 09:15 AM', amount: '+ ₹ 15,000', type: 'income', icon: '💻', color: 'bg-blue-100' },
  { id: 3, title: 'Petrol', time: 'Yesterday, 08:45 PM', amount: '- ₹ 1,500', type: 'expense', icon: '⛽', color: 'bg-purple-100' },
  { id: 4, title: 'Movie Tickets', time: 'Yesterday, 07:30 PM', amount: '- ₹ 600', type: 'expense', icon: '🎟️', color: 'bg-pink-100' },
  { id: 5, title: 'Salary', time: '24 May 2025', amount: '+ ₹ 75,000', type: 'income', icon: '💼', color: 'bg-green-100' },
];

const topInvestments = [
  { name: 'INFY', fullname: 'Infosys Ltd.', value: '₹ 1,25,430', change: '+12.5%', isPositive: true, logo: 'I' },
  { name: 'RELIANCE', fullname: 'Reliance Industries', value: '₹ 3,10,250', change: '+8.7%', isPositive: true, logo: 'R' },
  { name: 'HDFCBANK', fullname: 'HDFC Bank Ltd.', value: '₹ 1,85,600', change: '+15.2%', isPositive: true, logo: 'H' },
  { name: 'TCS', fullname: 'Tata Consultancy', value: '₹ 64,420', change: '+10.1%', isPositive: true, logo: 'T' },
];

function StatCard({ title, amount, change, isPositive, subtitle }) {
  return (
    <Card className="p-5 flex flex-col gap-2">
      <div className="text-sm font-medium text-text-muted">{title}</div>
      <div className="flex items-end gap-2 mt-1">
        <h3 className="text-2xl font-bold text-text-main">{amount}</h3>
        {subtitle && <span className="text-sm text-text-muted mb-1">{subtitle}</span>}
      </div>
      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {change} <span className="text-text-muted ml-1 font-normal">vs last month</span>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Income" amount="₹ 1,24,350" change="12.5%" isPositive={true} />
        <StatCard title="Total Expenses" amount="₹ 68,240" change="8.3%" isPositive={false} />
        <StatCard title="Net Savings" amount="₹ 56,110" change="16.7%" isPositive={true} />
        <StatCard title="Investments" amount="₹ 4,85,700" subtitle="(Current)" change="15.4%" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow */}
        <Card className="col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Cash Flow Overview</h3>
            <select className="text-sm border-border border rounded px-2 py-1 bg-surface outline-none">
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Recent Transactions</h3>
            <a href="#" className="text-sm text-primary hover:underline font-medium">View all</a>
          </div>
          <div className="space-y-5">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ${tx.color}`}>
                    {tx.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-text-main">{tx.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{tx.time}</div>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${tx.type === 'income' ? 'text-success' : 'text-text-main'}`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense by Category */}
        <Card className="col-span-1 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Expense by Category</h3>
            <button><MoreHorizontal className="w-5 h-5 text-text-muted" /></button>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="h-[200px] w-full relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-text-main">₹68,240</span>
                <span className="text-xs text-text-muted">Total</span>
              </div>
            </div>
            
            <div className="w-full mt-auto space-y-3">
              {expenseData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-text-muted font-medium">{item.name}</span>
                  </div>
                  <div className="font-semibold text-text-main">
                    ₹{item.value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Investments */}
        <Card className="col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Top Investments</h3>
            <a href="#" className="text-sm text-primary hover:underline font-medium">View all</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topInvestments.map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-border rounded-xl hover:shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-border/30 flex items-center justify-center font-bold text-gray-500 dark:text-text-muted text-xl border border-gray-100 dark:border-border">
                    {inv.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-text-main">{inv.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{inv.fullname}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-text-main mb-1">{inv.value}</div>
                  <div className={`text-xs font-medium flex items-center justify-end ${inv.isPositive ? 'text-success' : 'text-danger'}`}>
                    {inv.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {inv.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}