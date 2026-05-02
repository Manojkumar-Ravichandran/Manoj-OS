"use client";

import { Search, Sun, Moon, Bell } from "lucide-react";
import Input from "./ui/Input";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header({ onToggleSidebar }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
      {/* LEFT → Logo & Mobile Menu */}
      <div className="flex items-center gap-3 lg:w-56 shrink-0">
        <button 
          onClick={onToggleSidebar}
          className="p-2 -ml-2 lg:hidden text-text-muted hover:text-text-main hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight whitespace-nowrap hidden sm:block">Manoj OS</span>
        </div>
      </div>

      {/* CENTER → Search (Hidden on mobile, shown on md+) */}
      <div className="flex-1 hidden md:flex items-center justify-center px-4">
        <div className="max-w-md w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input 
            placeholder="Search (Ctrl + K)" 
            className="pl-10 bg-gray-50 border-transparent focus:bg-surface focus:border-primary h-10 w-full dark:bg-gray-800/50"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 md:gap-5 text-text-muted ml-auto md:ml-4">
        <button className="p-2 md:hidden hover:text-text-main transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        {mounted && (
          <button 
            className="p-2 hover:text-text-main transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        )}
        <button className="p-2 hover:text-text-main transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 overflow-hidden flex items-center justify-center text-primary font-semibold text-sm cursor-pointer ml-1">
          M
        </div>
      </div>
    </div>
  );
}