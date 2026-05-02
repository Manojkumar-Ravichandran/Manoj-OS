"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  CheckCircle2, Circle, Filter, Plus, Search, 
  Clock, AlertCircle, Calendar, Tag, MoreVertical,
  Trash2, ChevronRight, Inbox, Layout, CheckCircle,
  BarChart3, Settings, HelpCircle, ArrowUpRight, ArrowDownRight,
  GripVertical
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) {
        if (data.data.length === 0) {
          // Dummy data for demo
          setTasks([
            { _id: "1", title: "Review monthly expenses", category: "Finance", status: "Todo", priority: "High", createdAt: new Date() },
            { _id: "2", title: "Follow up with Rahul", category: "CRM", status: "In Progress", priority: "Medium", createdAt: new Date() },
            { _id: "3", title: "Pay electricity bill", category: "Finance", status: "Todo", priority: "Urgent", createdAt: new Date() },
            { _id: "4", title: "Plan next week content", category: "Work", status: "Done", priority: "Low", createdAt: new Date() },
          ]);
        } else {
          setTasks(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    if (e.key === "Enter" && newTaskTitle.trim()) {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: newTaskTitle,
            status: "Todo",
            priority: "Medium",
            category: "Personal"
          }),
        });
        const data = await res.json();
        if (data.success) {
          setNewTaskTitle("");
          fetchTasks();
        }
      } catch (error) {
        console.error("Create failed:", error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Done" ? "Todo" : "Done";
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, completed: nextStatus === "Done" }),
      });
      const data = await res.json();
      if (data.success) fetchTasks();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchTasks();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesFilter = filter === "All" || t.status === filter;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-danger bg-danger/10 border-danger/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-text-muted bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'In Progress': return <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>;
      case 'Backlog': return <Clock className="w-5 h-5 text-text-muted" />;
      default: return <Circle className="w-5 h-5 text-text-muted hover:text-primary transition-colors" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 max-w-[1400px] mx-auto w-full h-[calc(100vh-120px)] overflow-hidden animate-in fade-in duration-500">
      <div className="flex h-full flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
        
        {/* Workspace Filters - Horizontal on Mobile, Sidebar on Desktop */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar lg:overflow-visible px-1">
            {['All', 'Todo', 'In Progress', 'Done', 'Backlog'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:w-full ${
                  filter === s 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-text-muted hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  {s === 'All' ? <Inbox className="w-4 h-4" /> : 
                   s === 'Todo' ? <Circle className="w-4 h-4" /> :
                   s === 'In Progress' ? <Layout className="w-4 h-4" /> :
                   s === 'Done' ? <CheckCircle className="w-4 h-4" /> :
                   <Clock className="w-4 h-4" />}
                  <span>{s}</span>
                </div>
                <span className={`text-[10px] ml-2 ${filter === s ? 'opacity-80' : 'opacity-40'}`}>
                  {s === 'All' ? tasks.length : tasks.filter(t => t.status === s).length}
                </span>
              </button>
            ))}
          </div>

          {/* Stats - Hidden on small mobile */}
          <Card className="hidden lg:block p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Weekly Stats</span>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(tasks.filter(t => t.status === 'Done').length / tasks.length) * 100 || 0}%` }}></div>
              </div>
              <p className="text-[9px] text-text-muted font-bold text-center uppercase tracking-tighter">
                {tasks.filter(t => t.status === 'Done').length} of {tasks.length} tasks
              </p>
            </div>
          </Card>
        </div>

        {/* Main Content: Tasks Feed */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Top Bar */}
          <Card className="p-2 bg-surface/50 border-border/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input 
                  placeholder="Press Enter to add a new task..." 
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-bold text-text-main placeholder:text-text-muted/40 outline-none transition-all"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleCreateTask}
                />
              </div>
              <div className="flex items-center gap-2 px-2">
                <div className="h-6 w-[1px] bg-border mx-2"></div>
                <button className="p-2 hover:bg-muted rounded-xl text-text-muted transition-all"><Search className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-muted rounded-xl text-text-muted transition-all"><Filter className="w-4 h-4" /></button>
              </div>
            </div>
          </Card>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 pb-6">
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <Card key={i} className="h-16 animate-pulse bg-surface/30 border-border/20"></Card>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-text-muted/50" />
                </div>
                <h3 className="text-lg font-black text-text-main">No tasks found</h3>
                <p className="text-text-muted text-xs font-medium max-w-xs mx-auto mt-1">Try switching filters or add a new task to your workspace.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <Card 
                  key={task._id} 
                  className="p-3 flex items-center justify-between hover:shadow-xl hover:border-primary/30 transition-all group border-border/40 bg-surface/80 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button 
                      onClick={() => handleToggleStatus(task._id, task.status)}
                      className="shrink-0 transition-transform hover:scale-110"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-bold text-sm truncate transition-all ${task.status === 'Done' ? 'text-text-muted line-through' : 'text-text-main'}`}>
                          {task.title}
                        </span>
                        <Badge className={`text-[8px] font-black uppercase tracking-tighter border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-text-muted/60" />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-text-muted/60">{task.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-text-muted/60" />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-text-muted/60">
                            {new Date(task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 hover:bg-muted rounded-xl text-text-muted transition-all hover:text-primary">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(task._id)}
                      className="p-2 hover:bg-danger/10 rounded-xl text-text-muted transition-all hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="h-6 w-[1px] bg-border mx-1"></div>
                    <button className="p-2 cursor-grab active:cursor-grabbing text-text-muted/30">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar: Activity/Help (Optional/Hidden on smaller screens) */}
        <div className="w-72 shrink-0 hidden xl:flex flex-col gap-6">
           <Card className="p-5 bg-surface/50 border-border/40">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4">Focus Mode</h3>
             <div className="flex flex-col items-center text-center py-4">
               <div className="w-24 h-24 rounded-full border-4 border-primary/10 flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-2 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                  <span className="text-xl font-black text-text-main tracking-tighter">25:00</span>
               </div>
               <p className="text-xs font-bold text-text-muted mb-4 uppercase tracking-wider">Deep Work Session</p>
               <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold py-2 h-10">Start Session</Button>
             </div>
           </Card>

           <Card className="flex-1 p-5 bg-surface/50 border-border/40 overflow-hidden flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 shrink-0">Recent Activity</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex gap-3 relative pb-4 before:absolute before:left-2 before:top-6 before:bottom-0 before:w-[1px] before:bg-border last:before:hidden">
                      <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-surface shrink-0 relative z-10"></div>
                      <div>
                        <p className="text-[10px] font-bold text-text-main leading-tight mb-1">Created "Review monthly expenses" task</p>
                        <span className="text-[9px] text-text-muted font-medium uppercase tracking-tighter">2 hours ago</span>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
}

function Hash({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9"></line>
      <line x1="4" y1="15" x2="20" y2="15"></line>
      <line x1="10" y1="3" x2="8" y2="21"></line>
      <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
  );
}
