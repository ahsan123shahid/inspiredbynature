"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type DashboardData = {
  total_orders: number;
  total_revenue: number;
  total_customers: number;
  total_products: number;
  pending_orders: number;
  low_stock_count: number;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/admin/dashboard", true).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-center py-16">Loading...</div>;

  const cards = [
    { label: "Total Orders", value: data.total_orders },
    { label: "Revenue", value: `₨ ${data.total_revenue.toLocaleString()}` },
    { label: "Customers", value: data.total_customers },
    { label: "Products", value: data.total_products },
    { label: "Pending Orders", value: data.pending_orders, highlight: data.pending_orders > 0 },
    { label: "Low Stock Items", value: data.low_stock_count, highlight: data.low_stock_count > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className={`bg-canvas rounded-md p-6 border ${card.highlight ? "border-primary" : "border-hairline"}`}>
            <p className="text-sm text-shade-50 mb-2">{card.label}</p>
            <p className={`text-3xl font-bold ${card.highlight ? "text-primary" : "text-ink"}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
