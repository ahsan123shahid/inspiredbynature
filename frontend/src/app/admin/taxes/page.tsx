"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminTaxes() {
  const [tax, setTax] = useState<any>({});

  useEffect(() => {
    api.get("/taxes", true).then(setTax).catch(console.error);
  }, []);

  const save = async () => {
    await api.put("/taxes", tax, true);
    alert("Tax settings saved");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Tax Settings</h1>
      <div className="space-y-4">
        {["digital", "food", "nonfood"].map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1 capitalize">{key} Tax (%)</label>
            <input value={tax[key] || ""} onChange={(e) => setTax({ ...tax, [key]: e.target.value })} className="input-field" />
          </div>
        ))}
        <button onClick={save} className="btn-primary">Save Tax Settings</button>
      </div>
    </div>
  );
}
