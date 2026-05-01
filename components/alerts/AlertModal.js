"use client";

import { useState, useEffect } from "react";
import { X, Bell, Calendar, Tag, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function AlertModal({ isOpen, onClose, onSuccess, editData = null }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "Personal",
    priority: "Medium",
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title,
        subtitle: editData.subtitle || "",
        category: editData.category,
        priority: editData.priority,
        dueDate: new Date(editData.dueDate).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        category: "Personal",
        priority: "Medium",
        dueDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [editData, isOpen]);

  const [addAnother, setAddAnother] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = "/api/alerts";
      const method = editData ? "PUT" : "POST";
      const res = await fetch(editData ? `${url}?id=${editData._id}` : url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        if (addAnother && !editData) {
          setFormData({
            title: "",
            subtitle: "",
            category: "Personal",
            priority: "Medium",
            dueDate: new Date().toISOString().split('T')[0],
          });
        } else {
          onClose();
        }
      }
    } catch (error) {
      console.error("Failed to save alert:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md overflow-hidden shadow-2xl border-primary/20 bg-surface/95 backdrop-blur-md">
        <div className="p-6 border-b border-border flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-text-main">{editData ? "Edit Alert" : "Set New Alert"}</h2>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Stay ahead of your schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Alert Title</label>
            <Input 
              placeholder="e.g. Credit Card Bill" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="h-11 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Description / Amount</label>
            <Input 
              placeholder="e.g. ₹ 2,500 due for HDFC" 
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              className="h-11 bg-background/50 border-border/50 focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 text-nowrap flex items-center gap-1">
                <Tag className="w-3 h-3" /> Category
              </label>
              <select 
                className="w-full h-11 px-3 bg-background/50 border border-border/50 rounded-lg text-sm outline-none focus:border-primary/50 transition-all text-text-main"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Personal">Personal</option>
                <option value="Financial">Financial</option>
                <option value="Market">Market</option>
                <option value="System">System</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 text-nowrap flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due Date
              </label>
              <Input 
                type="date" 
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="h-11 bg-background/50 border-border/50 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Priority</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p})}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                    formData.priority === p 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-background/30 border-border/50 text-text-muted hover:border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {!editData && (
            <div className="flex items-center gap-2 px-1">
              <input 
                type="checkbox" 
                id="addAnother" 
                checked={addAnother}
                onChange={(e) => setAddAnother(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <label htmlFor="addAnother" className="text-xs font-semibold text-text-muted cursor-pointer">Create another alert immediately</label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 font-bold">Cancel</Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-11 font-bold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20">
              {isLoading ? "Saving..." : editData ? "Update Alert" : "Set Alert"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
