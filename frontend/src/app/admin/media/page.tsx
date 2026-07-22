"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminMedia() {
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ items: any[] }>("/media", true).then((d) => setFiles(d.items)).catch(console.error);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/api/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setFiles([{ filename: data.filename, url: data.url, size: file.size }, ...files]);
      }
    } catch { /* ignore */ }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Media Library</h1>
      <label className="btn-primary inline-block cursor-pointer mb-8">
        Upload File
        <input type="file" className="hidden" onChange={handleUpload} />
      </label>
      <div className="grid grid-cols-6 gap-4">
        {files.map((f: any) => (
          <div key={f.filename} className="bg-canvas rounded-md border border-hairline p-2 text-center">
            <div className="aspect-square bg-shade-20 rounded-sm mb-2" />
            <p className="text-xs truncate">{f.filename}</p>
            <p className="text-xs text-shade-50">{(f.size / 1024).toFixed(0)} KB</p>
          </div>
        ))}
      </div>
    </div>
  );
}
