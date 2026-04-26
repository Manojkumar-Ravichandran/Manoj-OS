"use client";

import { Search, Filter, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

const contacts = [
  { name: "Rahul Sharma", company: "Sharma & Co.", email: "rahul@sharmaco.com", phone: "9876543210", lastContact: "25 May 2025", tag: "Client" },
  { name: "Priya Mehta", company: "Mehta Solutions", email: "priya@mehta.com", phone: "9123456780", lastContact: "24 May 2025", tag: "Lead" },
  { name: "Amit Verma", company: "Verma Enterprises", email: "amit@verma.com", phone: "9988776655", lastContact: "23 May 2025", tag: "Partner" },
  { name: "Neha Singh", company: "Singh & Associates", email: "neha@singh.com", phone: "8899776655", lastContact: "22 May 2025", tag: "Client" },
  { name: "Vikram Patel", company: "Patel Traders", email: "vikram@patel.com", phone: "7766554433", lastContact: "21 May 2025", tag: "Lead" },
  { name: "Karan Gupta", company: "Gupta Corp", email: "karan@gupta.com", phone: "6655443322", lastContact: "20 May 2025", tag: "Client" },
  { name: "Sneha Iyer", company: "Iyer Tech", email: "sneha@iyer.com", phone: "5544332211", lastContact: "19 May 2025", tag: "Partner" },
];

export default function CrmPage() {
  const tableData = contacts.map(c => [
    <span key={c.name + 'name'} className="font-medium text-text-main">{c.name}</span>,
    c.company,
    c.email,
    c.phone,
    c.lastContact,
    <Badge key={c.name + 'tag'} variant={c.tag === 'Client' ? 'primary' : c.tag === 'Lead' ? 'warning' : 'success'}>{c.tag}</Badge>
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        {['Contacts', 'Companies', 'Deals', 'Activities'].map((tab, i) => (
          <div 
            key={tab} 
            className={`pb-3 font-medium text-sm cursor-pointer ${i === 0 ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text-main'}`}
          >
            {tab}
          </div>
        ))}
      </div>

      <Card className="flex flex-col">
        {/* Actions Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input placeholder="Search contacts..." className="pl-10 bg-gray-50 dark:bg-gray-800/50" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Contact
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table 
          columns={['Name', 'Company', 'Email', 'Phone', 'Last Contact', 'Tags']}
          data={tableData}
        />

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-muted">
          <div>Showing 1 to 7 of 12 contacts</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="w-8 px-0 text-text-muted">&lt;</Button>
            <Button variant="primary" size="sm" className="w-8 px-0">1</Button>
            <Button variant="outline" size="sm" className="w-8 px-0">2</Button>
            <Button variant="outline" size="sm" className="w-8 px-0 text-text-muted">&gt;</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
