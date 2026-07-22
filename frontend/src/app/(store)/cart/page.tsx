"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

type CartItem = {
  id: number;
  pro_id: number;
  product_title: string;
  product_image?: string;
  product_size?: string;
  product_price: number;
  quantity: number;
  total: number;
};

export default function CartPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.get<{ items: CartItem[]; total: number }>("/cart", true)
      .then((d) => setItems(d.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const updateQty = async (id: number, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    await api.put(`/cart/${id}`, { quantity }, true);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity, total: i.product_price * quantity } : i));
  };

  const removeItem = async (id: number) => {
    await api.delete(`/cart/${id}`, true);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const total = items.reduce((sum, i) => sum + i.total, 0);

  if (loading) return <div className="text-center py-16">Loading...</div>;
  if (!user) return <div className="text-center py-16"><Link href="/login" className="text-primary underline">Login to view your cart</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Bag</h1>
      {items.length === 0 ? (
        <p className="text-shade-50">Your bag is empty. <Link href="/shop" className="text-ink underline">Start shopping</Link></p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-canvas rounded-md border border-hairline p-4">
                <div className="w-20 h-20 bg-shade-20 rounded-sm flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product_title}</h3>
                  {item.product_size && <p className="text-sm text-shade-50">{item.product_size}</p>}
                  <p className="text-sm font-bold mt-1">₨ {item.product_price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 bg-shade-20 rounded-sm text-sm">-</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 bg-shade-20 rounded-sm text-sm">+</button>
                </div>
                <div className="text-right">
                  <p className="font-bold">₨ {item.total.toLocaleString()}</p>
                  <button onClick={() => removeItem(item.id)} className="text-xs text-shade-50 hover:text-red-500 mt-1">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-hairline mt-8 pt-6 text-right">
            <p className="text-lg font-bold">Total: ₨ {total.toLocaleString()}</p>
            <Link href="/checkout" className="btn-primary mt-4 inline-block">Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
}
