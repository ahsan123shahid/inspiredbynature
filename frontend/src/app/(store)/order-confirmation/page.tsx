"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="max-w-md mx-auto px-8 py-16 text-center">
      <div className="text-6xl mb-6">&#10003;</div>
      <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-shade-50 mb-2">Thank you for your order.</p>
      {orderId && <p className="text-sm text-shade-50 mb-8">Order #{orderId}</p>}
      <Link href="/order-history" className="btn-primary inline-block">View Orders</Link>
    </div>
  );
}
