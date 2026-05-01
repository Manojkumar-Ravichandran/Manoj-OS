"use client";

import Card from "@/components/ui/Card";
import { CreditCard, Zap, TrendingUp, Shield, Wrench } from "lucide-react";

const alerts = [
  { id: 1, title: "Credit Card Bill Due", subtitle: "HDFC Credit Card", date: "Due in 2 days", icon: CreditCard, color: "text-danger bg-danger-light" },
  { id: 2, title: "Electricity Bill Due", subtitle: "₹ 2,400", date: "Due in 3 days", icon: Zap, color: "text-warning bg-warning-light" },
  { id: 3, title: "SIP Investment", subtitle: "₹ 5,000", date: "Due in 5 days", icon: TrendingUp, color: "text-primary bg-primary-light" },
  { id: 4, title: "Insurance Premium", subtitle: "Health Insurance", date: "Due in 7 days", icon: Shield, color: "text-success bg-success-light" },
  { id: 5, title: "Annual Maintenance", subtitle: "Car Service", date: "Due in 12 days", icon: Wrench, color: "text-gray-600 bg-gray-200" },
];

export default function AlertsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto w-full">
      <div className="space-y-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <Card key={alert.id} className="p-5 flex items-center justify-between hover:shadow-md transition-all hover:border-gray-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alert.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-main text-lg">{alert.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{alert.subtitle}</p>
                </div>
              </div>
              <div className={`text-sm font-semibold ${alert.date.includes('2 days') || alert.date.includes('3 days') ? 'text-danger' : alert.date.includes('5 days') || alert.date.includes('7 days') ? 'text-warning' : 'text-text-muted'}`}>
                {alert.date}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
