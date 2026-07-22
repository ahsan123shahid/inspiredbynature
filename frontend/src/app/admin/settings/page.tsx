"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminSettings() {
  const [store, setStore] = useState<any>({});

  useEffect(() => {
    api.get("/store", true).then(setStore).catch(console.error);
  }, []);

  const save = async () => {
    await api.put("/store", store, true);
    alert("Settings saved");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Store Settings</h1>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store Name</label>
            <input value={store.StoreName || ""} onChange={(e) => setStore({ ...store, StoreName: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={store.StoreEmail || ""} onChange={(e) => setStore({ ...store, StoreEmail: e.target.value })} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input value={store.Phone || ""} onChange={(e) => setStore({ ...store, Phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <input value={store.Currency || ""} onChange={(e) => setStore({ ...store, Currency: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input value={store.Streets || ""} onChange={(e) => setStore({ ...store, Streets: e.target.value })} className="input-field" />
        </div>
        <button onClick={save} className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
}
