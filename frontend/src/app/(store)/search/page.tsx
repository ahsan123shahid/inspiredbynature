"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const search = async () => {
    if (!query.trim()) return;
    const data = await api.get<{ items: any[] }>(`/products?search=${encodeURIComponent(query)}`);
    setResults(data.items);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <div className="flex gap-2 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search fragrances..."
          className="input-field flex-1"
        />
        <button onClick={search} className="btn-primary">Search</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((p: any) => <ProductCard key={p.id} {...p} />)}
      </div>
    </div>
  );
}
