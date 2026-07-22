"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    api.get<{ items: any[] }>("/users", true).then((d) => setCustomers(d.items)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Customers</h1>
      <div className="bg-canvas rounded-md border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-shade-20 text-left">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((u: any) => (
              <tr key={u.id} className="border-t border-hairline">
                <td className="p-4">{u.name} {u.lastname}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><span className="text-xs bg-shade-20 px-2 py-0.5 rounded-pill">{u.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
