"use client";

import { CheckCircle2, Circle, Filter, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const taskGroups = [
  {
    title: "Today",
    tasks: [
      { id: 1, title: "Review monthly expenses", category: "Finance", date: "Today", completed: false },
      { id: 2, title: "Follow up with Rahul", category: "CRM", date: "Today", completed: false },
    ]
  },
  {
    title: "Tomorrow",
    tasks: [
      { id: 3, title: "Pay electricity bill", category: "Finance", date: "Tomorrow", completed: false },
    ]
  },
  {
    title: "Weekly",
    tasks: [
      { id: 4, title: "Plan next week content", category: "Work", date: "28 May 2025", completed: false },
    ]
  }
];

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto w-full">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {['My Tasks', 'All Tasks', 'Completed'].map((tab, i) => (
          <div 
            key={tab} 
            className={`pb-3 font-medium text-sm cursor-pointer ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filters
        </Button>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      <div className="space-y-8">
        {taskGroups.map((group, i) => (
          <div key={i}>
            <h3 className="font-semibold text-sm text-text-muted mb-4">{group.title}</h3>
            <div className="space-y-3">
              {group.tasks.map((task) => (
                <Card key={task.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow group">
                  <div className="flex items-center gap-4">
                    <button className="text-text-muted hover:text-success transition-colors">
                      {task.completed ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-text-main group-hover:text-primary transition-colors">{task.title}</span>
                      <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800/50">{task.category}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-text-muted">
                    {task.date}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
