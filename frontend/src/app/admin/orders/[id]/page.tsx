"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";

const validTransitions: Record<string, string[]> = {
  Pending: ["Processing", "Cancelled"],
  "Awaiting Verification": ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: ["Refunded"],
  Cancelled: [],
  Refunded: [],
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    api.get(`/orders/${id}`, true).then(setOrder).catch(console.error);
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      const updated = await api.post(`/orders/${id}/status`, { status }, true);
      setOrder(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!order) return <div className="text-center py-16">Loading...</div>;

  const nextStatuses = validTransitions[order.orderStatus] || [];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Order #{order.id}</h1>

      <div className="bg-canvas rounded-md border border-hairline p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-shade-50">Status</span>
          <span className="font-semibold">{order.orderStatus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-shade-50">Subtotal</span>
          <span className="font-semibold">₨ {order.subtotal?.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-shade-50">Date</span>
          <span>{order.orderDate || order.created_at?.slice(0, 10)}</span>
        </div>
      </div>

      {nextStatuses.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold mb-4">Update Status</h2>
          <div className="flex gap-2">
            {nextStatuses.map((s) => (
              <button key={s} onClick={() => updateStatus(s)} className="btn-outline text-sm">
                Mark as {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
