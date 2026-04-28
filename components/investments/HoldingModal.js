"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { addHolding, updateHolding } from "@/lib/redux/slices/holdingSlice";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function HoldingModal({ isOpen, onClose, editData = null, isViewOnly = false }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    broker: "Zerodha",
    stockName: "",
    symbol: "",
    quantity: "",
    avgPrice: "",
    pe: "",
    chartAnalysis: null,
    notes: "",
    history: [],
  });

  const brokers = ["Zerodha", "Upstox", "Angel One", "Groww", "ICICI Direct", "Others"];

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        date: new Date(editData.date).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        broker: "Zerodha",
        stockName: "",
        symbol: "",
        quantity: "",
        avgPrice: "",
        pe: "",
        chartAnalysis: null,
        notes: "",
        history: [],
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewOnly) {
      onClose();
      return;
    }
    try {
      if (editData) {
        await dispatch(updateHolding({ id: editData._id, holding: formData })).unwrap();
      } else {
        await dispatch(addHolding(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      alert(err || "Failed to save holding.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, chartAnalysis: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const chartData = (formData.history || [])
    .map(h => ({
      date: new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      pe: h.pe,
      price: h.price
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isViewOnly ? "Holding Details" : (editData ? "Edit Holding" : "Add Holding")}
      className="max-w-[1000px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[85vh] overflow-y-auto px-1">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Purchase Date</label>
            <Input type="date" name="date" value={formData.date} onChange={handleChange} required disabled={isViewOnly} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Broker</label>
            <select 
              name="broker" 
              value={formData.broker} 
              onChange={handleChange}
              disabled={isViewOnly}
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-70"
            >
              {brokers.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Stock Name</label>
            <Input name="stockName" value={formData.stockName} onChange={handleChange} required disabled={isViewOnly} placeholder="e.g. Infosys Ltd." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Symbol</label>
            <Input name="symbol" value={formData.symbol} onChange={handleChange} required disabled={isViewOnly} placeholder="e.g. INFY" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Quantity</label>
            <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required disabled={isViewOnly} placeholder="0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Avg. Price</label>
            <Input type="number" name="avgPrice" value={formData.avgPrice} onChange={handleChange} required disabled={isViewOnly} placeholder="0.00" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">P/E Ratio</label>
            <Input type="number" step="0.01" name="pe" value={formData.pe} onChange={handleChange} disabled={isViewOnly} placeholder="0.00" />
          </div>
        </div>

        {isViewOnly && chartData.length > 0 && (
          <div className="flex flex-col gap-2 text-left mt-2">
            <label className="text-sm font-medium text-text-muted">P/E & Price History</label>
            <div className="h-[250px] w-full border border-border rounded-lg p-4 bg-muted/10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="pe" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="P/E Ratio" />
                  <Line yAxisId="right" type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Price" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-medium text-text-muted">Chart Analysis Image</label>
          {!isViewOnly ? (
            <div className="flex items-center gap-4">
              <Input type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
              {formData.chartAnalysis && (
                <button 
                  type="button" 
                  onClick={() => setFormData(p => ({ ...p, chartAnalysis: null }))}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ) : null}
          {formData.chartAnalysis && (
            <div className="mt-2 border border-border rounded-lg overflow-hidden max-h-[400px] flex items-center justify-center bg-muted">
              <img src={formData.chartAnalysis} alt="Chart Analysis" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>

        {formData.history && formData.history.length > 0 && (
          <div className="flex flex-col gap-2 text-left mt-2">
            <label className="text-sm font-medium text-text-muted">Transaction History</label>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-text-muted">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">P/E</th>
                    <th className="px-3 py-2 font-medium">Broker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {formData.history.map((h, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="px-3 py-2">{new Date(h.date).toLocaleDateString('en-GB')}</td>
                      <td className="px-3 py-2">{h.quantity}</td>
                      <td className="px-3 py-2">₹ {Number(h.price).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2">{h.pe || '-'}</td>
                      <td className="px-3 py-2 text-text-muted">{h.broker}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-medium text-text-muted">Notes (Optional)</label>
          <textarea 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange}
            disabled={isViewOnly}
            className="flex min-h-[80px] w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-70"
            placeholder="Technical or fundamental notes..."
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
