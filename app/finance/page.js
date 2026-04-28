"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Download, Filter, Plus, Pencil, Trash2, Eye } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import TransactionModal from "@/components/finance/TransactionModal";
import { fetchTransactions, deleteTransaction } from "@/lib/redux/slices/financeSlice";

export default function FinancePage() {
  const dispatch = useDispatch();
  const { transactions = [], status } = useSelector((state) => state.finance || {});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setIsModalOpen(true);
  };

  const handleView = (transaction) => {
    setViewData(transaction);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      dispatch(deleteTransaction(id));
    }
  };

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const tableData = [...(transactions || [])]
    .sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .map(t => [
    new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    <span className={`font-medium ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>{t.type}</span>,
    t.category + (t.subCategory ? ` (${t.subCategory})` : ""),
    t.description || "-",
    <span className={`font-medium ${t.type === 'Income' ? 'text-success' : 'text-danger'}`}>
      {t.type === 'Income' ? '+ ' : '- '}₹ {Number(t.amount || 0).toLocaleString('en-IN')}
    </span>,
    t.account,
    <div className="flex gap-2">
      <button onClick={() => handleView(t)} className="p-1 hover:text-primary transition-colors" title="View Details">
        <Eye className="w-4 h-4" />
      </button>
      <button onClick={() => handleEdit(t)} className="p-1 hover:text-primary transition-colors" title="Edit">
        <Pencil className="w-4 h-4" />
      </button>
      <button onClick={() => handleDelete(t._id)} className="p-1 hover:text-danger transition-colors" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  ]);

  const totalIncome = (transactions || []).filter(t => t.type === 'Income').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpenses = (transactions || []).filter(t => t.type === 'Expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const netSavings = totalIncome - totalExpenses;


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
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> Add Transaction
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
          <div className="p-6">
            <div className="text-sm font-medium text-text-muted mb-2">Total Income</div>
            <div className="text-2xl font-bold text-success">₹ {totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-6">
            <div className="text-sm font-medium text-text-muted mb-2">Total Expenses</div>
            <div className="text-2xl font-bold text-danger">₹ {totalExpenses.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-6">
            <div className="text-sm font-medium text-text-muted mb-2">Net Savings</div>
            <div className="text-2xl font-bold text-primary">₹ {netSavings.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-6 flex items-start justify-end">
             <select className="text-sm border-border border rounded px-3 py-1.5 bg-surface outline-none">
              <option>This Month</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {status === 'loading' ? (
          <div className="p-12 text-center text-text-muted">Loading transactions...</div>
        ) : (
          <Table 
            columns={['Date', 'Type', 'Category', 'Description', 'Amount', 'Account', 'Actions']}
            data={tableData}
          />
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
          <div>Showing {transactions.length} transactions</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="w-8 px-0 text-text-muted">&lt;</Button>
            <Button variant="primary" size="sm" className="w-8 px-0">1</Button>
            <Button variant="outline" size="sm" className="w-8 px-0 text-text-muted">&gt;</Button>
          </div>
        </div>
      </Card>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editData}
      />

      <TransactionModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        editData={viewData}
        isViewOnly={true}
      />
    </div>
  );
}
