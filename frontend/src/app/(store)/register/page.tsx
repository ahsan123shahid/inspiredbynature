"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, lastname, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto px-8 py-16">
      <h1 className="text-2xl font-bold mb-8 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="First Name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
          <input type="text" placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} className="input-field" required />
        </div>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required minLength={6} />
        <button type="submit" className="btn-primary w-full">Create Account</button>
      </form>
      <p className="text-sm text-center mt-6 text-shade-50">
        Already have an account? <Link href="/login" className="text-ink underline">Login</Link>
      </p>
    </div>
  );
}
