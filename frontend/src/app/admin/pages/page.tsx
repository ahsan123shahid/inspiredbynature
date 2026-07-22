"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminPages() {
  const [pages, setPages] = useState<any[]>([]);

  useEffect(() => {
    api.get<any[]>("/pages", true).then(setPages).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">CMS Pages</h1>
      <div className="bg-canvas rounded-md border border-hairline">
        {pages.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between p-4 border-b border-hairline">
            <div>
              <span className="font-medium">{p.title}</span>
              <span className="text-xs text-shade-50 ml-3">{p.SEOurl}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
