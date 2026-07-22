"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [form, setForm] = useState({ code: "", type: "percentage", value: 0, min_order_value: 0 });

  useEffect(() => {
    api.get<any[]>("/coupons", true).then(setCoupons).catch(console.error);
  }, []);

  const add = async () => {
    try {
      const coupon = await api.post<any>("/coupons", form, true);
      setCoupons([...coupons, coupon]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const remove = async (id: number) => {
    await api.delete(`/coupons/${id}`, true);
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Discounts & Coupons</h1>
      <div className="grid grid-cols-5 gap-2 mb-6">
        <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field col-span-2" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
        <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} className="input-field" />
        <button onClick={add} className="btn-primary text-sm">Add</button>
      </div>
      <div className="bg-canvas rounded-md border border-hairline">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 border-b border-hairline">
            <div>
              <span className="font-mono text-sm">{c.code}</span>
              <span className="text-xs text-shade-50 ml-3">{c.type}: {c.value}{c.type === "percentage" ? "%" : ""}</span>
            </div>
            <button onClick={() => remove(c.id)} className="text-xs text-red-500">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
