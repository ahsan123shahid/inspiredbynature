"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    api.get<any[]>("/categories", true).then(setCategories).catch(console.error);
  }, []);

  const add = async () => {
    if (!newTitle.trim()) return;
    const cat = await api.post<any>("/categories", { cat_title: newTitle }, true);
    setCategories([...categories, cat]);
    setNewTitle("");
  };

  const remove = async (id: number) => {
    await api.delete(`/categories/${id}`, true);
    setCategories(categories.filter((c) => c.cat_id !== id));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Categories</h1>
      <div className="flex gap-2 mb-6">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New category name" className="input-field" />
        <button onClick={add} className="btn-primary text-sm">Add</button>
      </div>
      <div className="bg-canvas rounded-md border border-hairline">
        {categories.map((cat) => (
          <div key={cat.cat_id} className="flex items-center justify-between p-4 border-b border-hairline last:border-0">
            <span>{cat.cat_title}</span>
            <button onClick={() => remove(cat.cat_id)} className="text-xs text-red-500 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
