"use client";

import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/lib/redux/Provider";
import { useState } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-body text-text-main overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ReduxProvider>
            <div className="h-screen flex flex-col relative">
              {/* Header */}
              <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

              {/* Body */}
              <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                  <div 
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}

                {/* Sidebar - Desktop: Static, Mobile: Fixed Overlay */}
                <aside className={`
                  fixed inset-y-0 left-0 z-40 w-64 bg-surface transform transition-transform duration-300 ease-in-out
                  lg:relative lg:translate-x-0 lg:inset-auto lg:z-0
                  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}>
                  <Sidebar onClose={() => setIsSidebarOpen(false)} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-body w-full">
                  {children}
                </main>
              </div>
            </div>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}