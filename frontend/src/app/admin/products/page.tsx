"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get<{ items: any[] }>(`/products?page=${page}&size=20`, true).then((d) => setProducts(d.items)).catch(console.error);
  }, [page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary text-sm">Add Product</Link>
      </div>
      <div className="bg-canvas rounded-md border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-shade-20 text-left">
              <th className="p-4 font-medium">Title</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-hairline">
                <td className="p-4">{p.title}</td>
                <td className="p-4">₨ {p.price?.toLocaleString()}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-primary text-sm hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
