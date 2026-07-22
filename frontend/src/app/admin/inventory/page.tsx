"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminInventory() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ items: any[] }>("/products?size=50", true).then((d) => setProducts(d.items)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Inventory</h1>
      <div className="bg-canvas rounded-md border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-shade-20 text-left">
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">SKU</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-hairline">
                <td className="p-4">{p.title}</td>
                <td className="p-4 text-shade-50">{p.sku || "-"}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-pill ${(p.stock || 0) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {(p.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
