"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { 
  CreditCard, Zap, TrendingUp, Shield, Wrench, Plus, 
  Bell, Filter, Search, MoreVertical, Trash2, CheckCircle2,
  AlertCircle, Clock, Calendar, Target
} from "lucide-react";
import AlertModal from "@/components/alerts/AlertModal";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState("All");

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) {
        // If database is empty, use dummy data but save it or just show it
        if (data.data.length === 0) {
          setAlerts([
            { _id: "1", title: "Credit Card Bill Due", subtitle: "HDFC Credit Card", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), category: "Financial", priority: "High", status: "Active" },
            { _id: "2", title: "Electricity Bill Due", subtitle: "₹ 2,400", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), category: "Financial", priority: "Medium", status: "Active" },
            { _id: "3", title: "SIP Investment", subtitle: "₹ 5,000", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), category: "Market", priority: "High", status: "Active" },
            { _id: "4", title: "Insurance Premium", subtitle: "Health Insurance", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), category: "Financial", priority: "Low", status: "Active" },
          ]);
        } else {
          setAlerts(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this alert?")) return;
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchAlerts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Financial': return CreditCard;
      case 'Market': return TrendingUp;
      case 'System': return Zap;
      case 'Price': return Target;
      default: return Bell;
    }
  };

  const filteredAlerts = alerts.filter(a => filter === "All" || a.category === filter);

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1400px] mx-auto w-full h-[calc(100vh-120px)] overflow-hidden">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-1 md:px-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-text-main flex items-center gap-2">
            Alert Center <span className="text-primary text-[10px] bg-primary/10 px-2 py-0.5 rounded-full">{alerts.length}</span>
          </h1>
          <p className="text-text-muted text-xs md:text-sm font-medium">Manage notifications</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm outline-none focus:border-primary/50 transition-all shadow-sm h-10"
            />
          </div>
          <Button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="gap-2 h-10 font-bold bg-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Set Alert</span><span className="sm:hidden">Set</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
        {/* Category Filters - Horizontal on Mobile */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar lg:overflow-visible px-1">
            {['All', 'Financial', 'Market', 'Price', 'System', 'Personal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:w-full ${
                  filter === cat 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-text-muted hover:bg-muted'
                }`}
              >
                {cat}
                <span className={`text-[10px] ml-2 ${filter === cat ? 'opacity-80' : 'opacity-40'}`}>
                  {cat === 'All' ? alerts.length : alerts.filter(a => a.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          <Card className="hidden lg:block p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Next 48 Hours</span>
            </div>
            <p className="text-[10px] text-text-muted font-medium">You have 2 high priority alerts.</p>
          </Card>
        </div>

        {/* Main Feed: Alerts Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="h-40 animate-pulse bg-surface/50 border-border/30"></Card>
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-bold text-text-main">No alerts found</h3>
              <p className="text-text-muted text-sm max-w-xs mx-auto mt-1">Try adjusting your filters or create a new alert to get started.</p>
              <Button onClick={() => setIsModalOpen(true)} className="mt-6 gap-2">
                <Plus className="w-4 h-4" /> Create First Alert
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-min">
              {filteredAlerts.map((alert) => {
                const Icon = getCategoryIcon(alert.category);
                const isUrgent = alert.priority === 'High';
                const date = new Date(alert.dueDate);
                const diffDays = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card 
                    key={alert._id} 
                    className={`p-5 flex flex-col justify-between hover:shadow-xl hover:border-primary/40 transition-all group relative overflow-hidden border-border/40 bg-surface/80 ${isUrgent ? 'ring-1 ring-danger/10' : ''}`}
                  >
                    {isUrgent && (
                      <div className="absolute top-0 right-0 w-12 h-12">
                        <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-danger/5 rotate-45"></div>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          alert.category === 'Financial' ? 'bg-success/10 text-success' :
                          alert.category === 'Market' ? 'bg-primary/10 text-primary' :
                          alert.category === 'Price' ? 'bg-indigo-500/10 text-indigo-500' :
                          'bg-warning/10 text-warning'
                        } shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1">
                          {alert.symbol && (
                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter bg-indigo-500/5 text-indigo-500 border-indigo-500/20">
                              {alert.symbol}
                            </Badge>
                          )}
                          <Badge variant={isUrgent ? "danger" : "outline"} className="text-[9px] uppercase font-bold tracking-tighter">
                            {alert.priority}
                          </Badge>
                          <button onClick={() => handleDelete(alert._id)} className="p-1 hover:bg-danger/10 hover:text-danger rounded transition-colors text-text-muted opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-text-main group-hover:text-primary transition-colors line-clamp-1">{alert.title}</h3>
                      <p className="text-xs text-text-muted font-medium mt-1 line-clamp-2 min-h-[32px]">{alert.subtitle}</p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-[10px] font-bold text-text-main uppercase tracking-tighter">
                          {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                        diffDays <= 2 ? 'bg-danger/10 text-danger animate-pulse' : 
                        diffDays <= 5 ? 'bg-warning/10 text-warning' : 
                        'bg-success/10 text-success'
                      }`}>
                        {diffDays <= 0 ? 'Due Today' : `In ${diffDays} days`}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AlertModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAlerts}
        editData={editData}
      />
    </div>
  );
}
