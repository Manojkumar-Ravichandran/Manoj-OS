"use client";

import { Search, Sun, Moon, Bell } from "lucide-react";
import Input from "./ui/Input";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* LEFT → Logo */}
      <div className="flex items-center gap-3 w-56 shrink-0">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-semibold text-lg tracking-tight">Manoj OS</span>
      </div>

      {/* CENTER → Search */}
      <div className="flex-1 flex items-center justify-between">
        <button className="p-2 mr-2 text-text-muted hover:text-text-main hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="max-w-md w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input 
            placeholder="Search (Ctrl + K)" 
            className="pl-10 bg-gray-50 border-transparent focus:bg-surface focus:border-primary h-10 w-full dark:bg-gray-800/50"
          />
        </div>
        <div className="flex-1"></div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5 text-text-muted ml-4">
        {mounted && (
          <button 
            className="hover:text-text-main transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        )}
        <button className="hover:text-text-main transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center text-primary font-semibold text-sm cursor-pointer ml-2">
          M
        </div>
      </div>
    </div>
  );
}