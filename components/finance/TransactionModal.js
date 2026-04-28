"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { addTransaction, updateTransaction } from "@/lib/redux/slices/financeSlice";

export default function TransactionModal({ isOpen, onClose, editData = null, isViewOnly = false }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "Expense",
    category: "food",
    description: "",
    amount: "",
    account: "IOB",
    subCategory: "Swiggy",
    petrol: "",
    startKm: "",
    endKm: "",
    duration: "",
    totalHrs: "",
    snacks: "",
    food: "",
    spend: "",
    earnings: "",
  });

  const categories = ["tea", "food", "snacks", "emi", "debt", "delivery"];
  const accounts = ["IOB", "HDFC Bank", "Cash", "Others"];

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        date: new Date(editData.date).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: "Expense",
        category: "food",
        description: "",
        amount: "",
        account: "IOB",
        subCategory: "Swiggy",
        petrol: "",
        startKm: "",
        endKm: "",
        duration: "",
        totalHrs: "",
        snacks: "",
        food: "",
        spend: "",
        earnings: "",
      });
    }
  }, [editData, isOpen]);

  // Automatic calculation for delivery category
  useEffect(() => {
    if (formData.category === "delivery") {
      const earnings = Number(formData.earnings || 0);
      const expenses = 
        Number(formData.petrol || 0) + 
        Number(formData.snacks || 0) + 
        Number(formData.spend || 0) + 
        Number(formData.food || 0);
      
      const calculatedAmount = earnings - expenses;
      setFormData(prev => ({ ...prev, amount: calculatedAmount }));
    }
  }, [formData.category, formData.earnings, formData.petrol, formData.snacks, formData.spend, formData.food]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) {
      onClose();
      return;
    }
    try {
      if (editData) {
        await dispatch(updateTransaction({ id: editData._id, transaction: formData })).unwrap();
      } else {
        await dispatch(addTransaction(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Failed to save transaction:", err);
      alert(err || "Failed to save transaction. Please check your inputs.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isDelivery = formData.category === "delivery";

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isViewOnly ? "Transaction Details" : (editData ? "Edit Transaction" : "Add Transaction")}
      className="max-w-[1000px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[85vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Date</label>
            <Input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              required 
              disabled={isViewOnly}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              disabled={isViewOnly}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-70"
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange}
              disabled={isViewOnly}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-70"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
              <option value="Salary">Salary</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Account</label>
            <select 
              name="account" 
              value={formData.account} 
              onChange={handleChange}
              disabled={isViewOnly}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-70"
            >
              {accounts.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {isDelivery && (
          <div className="bg-muted/30 p-4 rounded-lg flex flex-col gap-4 border border-border text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted">Sub Category</label>
                <select 
                  name="subCategory" 
                  value={formData.subCategory} 
                  onChange={handleChange}
                  disabled={isViewOnly}
                  className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-70"
                >
                  <option value="Swiggy">Swiggy</option>
                  <option value="Zomato">Zomato</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary">Earnings (Base Amount)</label>
                <Input 
                  type="number" 
                  name="earnings" 
                  value={formData.earnings} 
                  onChange={handleChange} 
                  disabled={isViewOnly}
                  className="bg-surface border-primary/30 focus:border-primary" 
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Petrol (-)</label>
                <Input type="number" name="petrol" value={formData.petrol} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Food (-)</label>
                <Input type="number" name="food" value={formData.food} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Snacks (-)</label>
                <Input type="number" name="snacks" value={formData.snacks} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Other Spend (-)</label>
                <Input type="number" name="spend" value={formData.spend} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-2 border-t border-border/50">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Start KM</label>
                <Input type="number" name="startKm" value={formData.startKm} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">End KM</label>
                <Input type="number" name="endKm" value={formData.endKm} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Total Hrs</label>
                <Input type="number" name="totalHrs" value={formData.totalHrs} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-text-muted font-medium">Duration</label>
                <Input name="duration" value={formData.duration} onChange={handleChange} disabled={isViewOnly} className="bg-surface" />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-medium text-text-muted">Description (Optional)</label>
          <Input 
            placeholder="e.g. Monthly groceries" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            disabled={isViewOnly}
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-medium text-text-muted">
            {isDelivery ? "Net Amount (Automatically Calculated)" : "Amount"}
          </label>
          <Input 
            type="number" 
            placeholder="0.00" 
            name="amount" 
            value={formData.amount} 
            onChange={handleChange} 
            required 
            disabled={isDelivery || isViewOnly}
            className={isDelivery ? "bg-muted font-bold text-primary" : ""}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            {isViewOnly ? "Close" : "Cancel"}
          </Button>
          {!isViewOnly && (
            <Button type="submit" variant="primary" className="flex-1">
              {editData ? "Update" : "Save"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
