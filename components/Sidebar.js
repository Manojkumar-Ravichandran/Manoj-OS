"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Wallet, 
  TrendingUp, 
  FileText, 
  Users, 
  CheckSquare, 
  Bell,
  BarChart2,
  Calculator,
  FolderOpen,
  Settings,
  User,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const mainNav = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Finance", path: "/finance", icon: Wallet },
  { name: "Investments", path: "/investments", icon: TrendingUp },
  { name: "Notes", path: "/notes", icon: FileText },
  { name: "CRM", path: "/crm", icon: Users },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Alerts", path: "/alerts", icon: Bell },
];

const toolsNav = [
  { name: "Reports", path: "/reports", icon: BarChart2 },
  { name: "Calculator", path: "/calculator", icon: Calculator },
  { name: "Files", path: "/files", icon: FolderOpen },
];

const settingsNav = [
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Profile", path: "/profile", icon: User },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      {title && <h3 className="px-6 text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">{title}</h3>}
      <div className="space-y-0.5 px-3">
        {items.map((item) => {
          const active = pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path} onClick={onClose}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-primary-light text-primary"
                    : "text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-primary" : "text-text-muted"}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-64 h-full bg-surface border-r border-border flex flex-col justify-between overflow-y-auto">
      <div className="py-6">
        <div className="flex items-center justify-between px-6 mb-8 lg:hidden">
           <span className="font-semibold text-lg tracking-tight">Manoj OS</span>
           <button onClick={onClose} className="p-2 text-text-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>
        <NavGroup items={mainNav} />
        <NavGroup title="Tools" items={toolsNav} />
        <NavGroup title="Settings" items={settingsNav} />
      </div>
      
      {/* Dark Mode Toggle at bottom */}
      {mounted && (
        <div className="p-4 mx-4 mb-4 border border-border rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
              {theme === 'dark' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
              <span>Dark Mode</span>
           </div>
           {/* Simple Toggle Switch */}
           <div 
             className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
           >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-200 ${theme === 'dark' ? 'left-4.5' : 'left-0.5'}`}></div>
           </div>
        </div>
      )}
    </div>
  );
}