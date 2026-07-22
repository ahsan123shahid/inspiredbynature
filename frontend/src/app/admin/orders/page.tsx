"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const endpoint = filter ? `/orders?status=${filter}` : "/orders";
    api.get<{ items: any[] }>(endpoint, true).then((d) => setOrders(d.items)).catch(console.error);
  }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Orders</h1>
      <div className="flex gap-2 mb-6">
        {["", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs rounded-pill ${filter === s ? "bg-ink text-on-primary" : "bg-shade-20"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>
      <div className="bg-canvas rounded-md border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-shade-20 text-left">
              <th className="p-4 font-medium">Order #</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t border-hairline">
                <td className="p-4">#{o.id}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-pill text-xs ${statusColors[o.orderStatus] || "bg-shade-20"}`}>
                    {o.orderStatus}
                  </span>
                </td>
                <td className="p-4">₨ {o.subtotal?.toLocaleString()}</td>
                <td className="p-4">{o.orderDate || o.created_at?.slice(0, 10)}</td>
                <td className="p-4">
                  <Link href={`/admin/orders/${o.id}`} className="text-primary text-sm hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
