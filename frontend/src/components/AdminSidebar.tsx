"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/discounts", label: "Discounts & Coupons" },
  { href: "/admin/theme", label: "Theme Editor" },
  { href: "/admin/settings", label: "Store Settings" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/taxes", label: "Tax Settings" },
  { href: "/admin/pages", label: "CMS Pages" },
  { href: "/admin/navigation", label: "Navigation" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ink text-on-primary min-h-screen p-6">
      <Link href="/admin/dashboard" className="text-lg font-bold block mb-8">Admin Panel</Link>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "block px-3 py-2 rounded-sm text-sm transition-colors",
              pathname === link.href || pathname.startsWith(link.href + "/")
                ? "bg-white/10 text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="block mt-8 text-sm text-white/40 hover:text-white/60">
        &larr; Back to Store
      </Link>
    </aside>
  );
}
