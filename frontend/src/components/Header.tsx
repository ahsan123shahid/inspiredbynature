"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header>
      <div className="bg-accent-pink-bar text-center text-xs py-1.5">
        Free shipping on orders over ₨ 2,500 — Use code NATURE10 for 10% off
      </div>
      <nav className="flex items-center justify-between px-8 py-4 bg-canvas">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Inspired by Nature
        </Link>
        <div className="flex items-center gap-6 nav-label">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/shop/men" className="hover:text-primary transition-colors">Men</Link>
          <Link href="/shop/women" className="hover:text-primary transition-colors">Women</Link>
          <Link href="/shop/unisex" className="hover:text-primary transition-colors">Unisex</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/search" className="hover:text-primary">Search</Link>
          <Link href="/wishlist" className="hover:text-primary">Wishlist</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/user-profile" className="hover:text-primary">{user.name}</Link>
              {isAdmin && <Link href="/admin/dashboard" className="text-primary font-semibold">Admin</Link>}
              <button onClick={logout} className="text-sm text-shade-50 hover:text-ink">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-primary">Account</Link>
          )}
          <Link href="/cart" className="relative hover:text-primary">Cart</Link>
        </div>
      </nav>
    </header>
  );
}
