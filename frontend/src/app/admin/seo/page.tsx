"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminSEO() {
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    api.get("/store", true).then(setStore).catch(console.error);
  }, []);

  const update = async () => {
    if (!store) return;
    await api.put("/store", {
      fb_pixel_id: store.fb_pixel_id,
      seo_settings: store.seo_settings,
    }, true);
    alert("SEO settings saved");
  };

  if (!store) return <div className="text-center py-16">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">SEO Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Facebook Pixel ID</label>
          <input value={store.fb_pixel_id || ""} onChange={(e) => setStore({ ...store, fb_pixel_id: e.target.value })} className="input-field" />
        </div>
        <button onClick={update} className="btn-primary">Save SEO Settings</button>
      </div>
    </div>
  );
}
