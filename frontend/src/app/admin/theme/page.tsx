"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminTheme() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    api.get("/store", true).then((store) => setSettings(store.theme_settings || {})).catch(console.error);
  }, []);

  const save = async () => {
    await api.put("/store/theme", { theme_settings: settings }, true);
    alert("Theme saved");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Theme Editor</h1>
      <div className="space-y-4">
        <h2 className="font-semibold">Banner Slides</h2>
        <p className="text-sm text-shade-50">Configure your homepage banner slideshow settings.</p>
        <button onClick={save} className="btn-primary">Save Theme</button>
      </div>
    </div>
  );
}
