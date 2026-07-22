import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline px-8 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold mb-4">Shop</h4>
          <div className="space-y-2 text-sm text-shade-50">
            <Link href="/shop/men" className="block hover:text-ink">Men</Link>
            <Link href="/shop/women" className="block hover:text-ink">Women</Link>
            <Link href="/shop/unisex" className="block hover:text-ink">Unisex</Link>
            <Link href="/shop" className="block hover:text-ink">All Fragrances</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Learn</h4>
          <div className="space-y-2 text-sm text-shade-50">
            <Link href="/fragrance-guide" className="block hover:text-ink">Fragrance Guide</Link>
            <Link href="/ingredients" className="block hover:text-ink">Ingredients</Link>
            <Link href="/about" className="block hover:text-ink">About Us</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Support</h4>
          <div className="space-y-2 text-sm text-shade-50">
            <Link href="/contact" className="block hover:text-ink">Contact</Link>
            <Link href="/shipping-returns" className="block hover:text-ink">Shipping & Returns</Link>
            <Link href="/faqs" className="block hover:text-ink">FAQs</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Newsletter</h4>
          <p className="text-sm text-shade-50 mb-3">Get 10% off your first order</p>
          <div className="flex">
            <input type="email" placeholder="Your email" className="input-field rounded-r-none flex-1" />
            <button className="bg-ink text-on-primary px-4 text-sm rounded-pill -ml-2">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-shade-40 mt-12">
        &copy; {new Date().getFullYear()} Inspired by Nature. All rights reserved.
      </div>
    </footer>
  );
}
