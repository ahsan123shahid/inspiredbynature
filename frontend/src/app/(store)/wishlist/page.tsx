"use client";

import { useState, useEffect } from "react";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const remove = (id: number) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-shade-50">Your wishlist is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between bg-canvas rounded-md border border-hairline p-4">
              <span>{item.title}</span>
              <button onClick={() => remove(item.id)} className="text-xs text-red-500">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
