"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function UserProfile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLastname(user.lastname);
    }
  }, [user]);

  const updateProfile = async () => {
    await api.put("/users/me", { name, lastname }, true);
    alert("Profile updated");
  };

  if (!user) return <div className="text-center py-16">Login to view your profile</div>;

  return (
    <div className="max-w-md mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input value={lastname} onChange={(e) => setLastname(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={user.email} disabled className="input-field bg-shade-20" />
        </div>
        <button onClick={updateProfile} className="btn-primary w-full">Save Changes</button>
        <button onClick={logout} className="btn-outline w-full">Logout</button>
      </div>
    </div>
  );
}
