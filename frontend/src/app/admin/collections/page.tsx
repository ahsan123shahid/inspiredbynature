"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    api.get<any[]>("/collections", true).then(setCollections).catch(console.error);
  }, []);

  const add = async () => {
    if (!title.trim()) return;
    const c = await api.post<any>("/collections", { title }, true);
    setCollections([...collections, c]);
    setTitle("");
  };

  const remove = async (id: number) => {
    await api.delete(`/collections/${id}`, true);
    setCollections(collections.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Collections</h1>
      <div className="flex gap-2 mb-6">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Collection name" className="input-field" />
        <button onClick={add} className="btn-primary text-sm">Add</button>
      </div>
      <div className="bg-canvas rounded-md border border-hairline">
        {collections.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 border-b border-hairline">
            <span>{c.title}</span>
            <button onClick={() => remove(c.id)} className="text-xs text-red-500">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
