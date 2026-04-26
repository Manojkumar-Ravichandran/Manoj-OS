"use client";

import { Search, Plus, List, Grid } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

const tags = [
  { name: "Personal", count: 8 },
  { name: "Finance", count: 6 },
  { name: "Ideas", count: 4 },
  { name: "Work", count: 5 },
  { name: "Health", count: 3 },
  { name: "Important", count: 2 },
];

const notes = [
  { title: "Buy health insurance", tag: "Personal", date: "24 May 2025", desc: "Compare different plans and choose the best one for family." },
  { title: "Investment Checklist", tag: "Finance", date: "23 May 2025", desc: "Review before investing in any new stock or mutual fund." },
  { title: "Project Ideas", tag: "Ideas", date: "22 May 2025", desc: "1. Personal OS\n2. AI Tools\n3. Finance Tracker" },
  { title: "Monthly Budget Plan", tag: "Finance", date: "20 May 2025", desc: "Plan monthly budget and track all expenses." },
  { title: "Workout Routine", tag: "Health", date: "19 May 2025", desc: "Morning: Cardio\nEvening: Strength training" },
  { title: "Book List", tag: "Personal", date: "18 May 2025", desc: "1. Atomic Habits\n2. Rich Dad Poor Dad" },
];

export default function NotesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-6">
           <div>
             <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Tags</div>
             <div className="space-y-1">
               {tags.map((tag, i) => (
                 <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full bg-blue-500`}></div>
                     <span className="text-text-main font-medium">{tag.name}</span>
                   </div>
                   <span className="text-text-muted text-xs">{tag.count}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <h2 className="font-bold text-lg">All Notes</h2>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                   <Input placeholder="Search notes..." className="pl-9 h-9" />
                 </div>
                 <div className="flex items-center border border-border rounded-md bg-surface p-0.5">
                    <button className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded shadow-sm text-text-main"><Grid className="w-4 h-4" /></button>
                    <button className="p-1.5 text-text-muted hover:text-text-main"><List className="w-4 h-4" /></button>
                 </div>
                 <Button className="gap-2 ml-2 h-9">
                   <Plus className="w-4 h-4" /> New Note
                 </Button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {notes.map((note, i) => (
               <Card key={i} className="p-5 flex flex-col hover:border-primary/50 transition-colors cursor-pointer group">
                  <h3 className="font-semibold text-lg text-text-main mb-2 group-hover:text-primary transition-colors">{note.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="primary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{note.tag}</Badge>
                    <span className="text-xs text-text-muted">{note.date}</span>
                  </div>
                  <p className="text-sm text-text-muted whitespace-pre-line leading-relaxed">
                    {note.desc}
                  </p>
               </Card>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
