"use client";

import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ReduxProvider } from "@/lib/redux/Provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-body text-text-main overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ReduxProvider>
            <div className="h-screen flex flex-col">
              {/* Header */}
              <Header />

              {/* Body */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-body">
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