"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [address, setAddress] = useState({ Name: "", address: "", city: "", state: "", zip: "", phone: "" });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  const applyCoupon = async () => {
    if (!coupon) return;
    try {
      const result = await api.post<{ valid: boolean; discount: number }>("/coupons/validate", { code: coupon, subtotal: 0 });
      if (result.valid) setDiscount(result.discount);
    } catch { /* ignore */ }
  };

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const order = await api.post<any>("/orders", { data: JSON.stringify(address), subtotal: 0 }, true);
      router.push(`/order-confirmation?id=${order.id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="space-y-4 mb-8">
        <h2 className="font-semibold">Shipping Address</h2>
        <input placeholder="Full Name" value={address.Name} onChange={(e) => setAddress({ ...address, Name: e.target.value })} className="input-field" />
        <input placeholder="Address" value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} className="input-field" />
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input-field" />
          <input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="ZIP Code" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} className="input-field" />
          <input placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="input-field" />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-4">Coupon Code</h2>
        <div className="flex gap-2">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter code" className="input-field flex-1" />
          <button onClick={applyCoupon} className="btn-outline text-sm">Apply</button>
        </div>
        {discount > 0 && <p className="text-sm text-success-green mt-2">Discount: ₨ {discount}</p>}
      </div>

      <button onClick={placeOrder} disabled={placing} className="btn-primary w-full">
        {placing ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}
