"use client";

import { Download, Filter, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";

const transactions = [
  { date: "26 May 2025", type: "Expense", category: "Food", desc: "Grocery Shopping", amount: "- ₹ 1,250", account: "HDFC Bank" },
  { date: "26 May 2025", type: "Income", category: "Work", desc: "Freelance Project", amount: "+ ₹ 15,000", account: "HDFC Bank" },
  { date: "25 May 2025", type: "Expense", category: "Transport", desc: "Petrol", amount: "- ₹ 1,500", account: "HDFC Bank" },
  { date: "25 May 2025", type: "Expense", category: "Entertainment", desc: "Movie Tickets", amount: "- ₹ 600", account: "HDFC Bank" },
  { date: "24 May 2025", type: "Income", category: "Salary", desc: "Monthly Salary", amount: "+ ₹ 75,000", account: "HDFC Bank" },
  { date: "23 May 2025", type: "Expense", category: "Bills", desc: "Electricity Bill", amount: "- ₹ 2,400", account: "HDFC Bank" },
  { date: "22 May 2025", type: "Expense", category: "Food", desc: "Restaurant", amount: "- ₹ 650", account: "HDFC Bank" },
  { date: "21 May 2025", type: "Expense", category: "Shopping", desc: "Amazon Purchase", amount: "- ₹ 3,280", account: "HDFC Bank" },
  { date: "20 May 2025", type: "Income", category: "Investments", desc: "Dividend", amount: "+ ₹ 2,750", account: "HDFC Bank" },
  { date: "19 May 2025", type: "Expense", category: "Transport", desc: "Auto Ride", amount: "- ₹ 120", account: "HDFC Bank" },
];

export default function FinancePage() {
  const tableData = transactions.map(t => [
    t.date,
    <span className={`font-medium ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>{t.type}</span>,
    t.category,
    t.desc,
    <span className={`font-medium ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>{t.amount}</span>,
    t.account
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {['Transactions', 'Budget', 'Categories', 'Accounts'].map((tab, i) => (
          <div 
            key={tab} 
            className={`pb-3 font-medium text-sm cursor-pointer ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      <Card className="flex flex-col">
        {/* Actions Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
          <div className="p-6">
            <div className="text-sm font-medium text-text-muted mb-2">Total Income</div>
            <div className="text-2xl font-bold text-success">₹ 1,24,350</div>
          </div>
          <div className="p-6">
            <div className="text-sm font-medium text-text-muted mb-2">Total Expenses</div>
            <div className="text-2xl font-bold text-danger">₹ 68,240</div>
          </div>
          <div className="p-6">
            <div className="text-sm font-medium text-text-muted mb-2">Net Savings</div>
            <div className="text-2xl font-bold text-primary">₹ 56,110</div>
          </div>
          <div className="p-6 flex items-start justify-end">
             <select className="text-sm border-border border rounded px-3 py-1.5 bg-surface outline-none">
              <option>This Month</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Table 
          columns={['Date', 'Type', 'Category', 'Description', 'Amount', 'Account']}
          data={tableData}
        />

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
          <div>Showing 1 to 10 of 26 transactions</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="w-8 px-0 text-text-muted">&lt;</Button>
            <Button variant="primary" size="sm" className="w-8 px-0">1</Button>
            <Button variant="outline" size="sm" className="w-8 px-0">2</Button>
            <Button variant="outline" size="sm" className="w-8 px-0">3</Button>
            <Button variant="outline" size="sm" className="w-8 px-0 text-text-muted">&gt;</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
