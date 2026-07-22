"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get<{ items: any[] }>("/orders", true).then((d) => setOrders(d.items)).catch(console.error);
  }, [user]);

  if (!user) return <div className="text-center py-16">Login to view your orders</div>;

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-shade-50">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <Link key={o.id} href={`/order-history?id=${o.id}`} className="block bg-canvas rounded-md border border-hairline p-4 hover:border-ink transition-colors">
              <div className="flex justify-between">
                <span className="font-semibold">Order #{o.id}</span>
                <span className="text-sm text-shade-50">{o.orderDate || o.created_at?.slice(0, 10)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-sm">Status: {o.orderStatus}</span>
                <span className="font-bold">₨ {o.subtotal?.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
