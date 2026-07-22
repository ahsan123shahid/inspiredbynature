"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminNavigation() {
  const [items, setItems] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    api.get<any[]>("/nav", true).then(setItems).catch(console.error);
  }, []);

  const add = async () => {
    if (!label.trim() || !slug.trim()) return;
    const item = await api.post<any>("/nav", { label, slug }, true);
    setItems([...items, item]);
    setLabel("");
    setSlug("");
  };

  const remove = async (id: number) => {
    await api.delete(`/nav/${id}`, true);
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Navigation Editor</h1>
      <div className="grid grid-cols-3 gap-2 mb-6">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="input-field" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="input-field" />
        <button onClick={add} className="btn-primary text-sm">Add Item</button>
      </div>
      <div className="bg-canvas rounded-md border border-hairline">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 border-b border-hairline">
            <div>
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-shade-50 ml-3">/{item.slug}</span>
            </div>
            <button onClick={() => remove(item.id)} className="text-xs text-red-500">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
