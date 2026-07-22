"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function AddToCartButton({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!user) {
      window.location.href = "/login?redirect=" + encodeURIComponent(`/product/${product.id}`);
      return;
    }
    setLoading(true);
    try {
      await api.post("/cart", {
        pro_id: product.id,
        product_title: product.title,
        product_image: product.image,
        product_price: product.price,
        quantity: qty,
      }, true);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center bg-shade-20 rounded-sm">
        <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-sm">-</button>
        <span className="px-3 py-2 text-sm">{qty}</span>
        <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-sm">+</button>
      </div>
      <button
        onClick={handleAdd}
        disabled={loading}
        className="btn-primary flex-1"
      >
        {loading ? "Adding..." : added ? "Added!" : "Add to Bag"}
      </button>
    </div>
  );
}
