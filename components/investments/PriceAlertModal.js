"use client";

import { useState } from "react";
import { X, Bell, Target, TrendingUp } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function PriceAlertModal({ isOpen, onClose, symbol, currentPrice }) {
  const [targetPrice, setTargetPrice] = useState(currentPrice || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Price Alert: ${symbol}`,
          subtitle: `Alert when ${symbol} hits ₹${targetPrice}`,
          category: "Price",
          symbol: symbol,
          targetPrice: Number(targetPrice),
          dueDate: new Date(), // Immediate/Active
          priority: "High",
        }),
      });
      const data = await res.json();
      if (data.success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to set price alert:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-sm overflow-hidden shadow-2xl border-primary/20 bg-surface/95 backdrop-blur-md">
        <div className="p-4 border-b border-border flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-text-main">Set Price Alert</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-border rounded-full transition-colors">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-muted uppercase">Symbol</span>
              <span className="text-base font-black text-text-main">{symbol}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-text-muted uppercase">Current</span>
              <span className="text-base font-black text-primary">₹{currentPrice?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 flex items-center gap-1">
              <Target className="w-3 h-3" /> Target Price
            </label>
            <Input 
              type="number"
              step="0.05"
              placeholder="Enter target price" 
              required
              autoFocus
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="h-11 bg-background/50 border-border/50 focus:border-primary/50 text-lg font-bold"
            />
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] text-text-muted font-medium leading-relaxed">
              You will be notified as soon as <span className="text-primary font-bold">{symbol}</span> reaches or crosses <span className="text-primary font-bold">₹{targetPrice || '0'}</span>.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 font-bold">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-10 font-bold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20">
              {isLoading ? "Setting..." : "Set Alert"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
