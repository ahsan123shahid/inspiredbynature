export default function ShippingReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Shipping & Returns</h1>
      <div className="space-y-6 text-sm text-shade-60">
        <section>
          <h2 className="font-semibold text-ink text-lg mb-2">Shipping</h2>
          <p>We offer free shipping on orders over ₨ 2,500. Standard delivery takes 3-5 business days within Pakistan. International shipping is available and takes 7-14 business days.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink text-lg mb-2">Returns</h2>
          <p>We accept returns within 14 days of delivery. Products must be unopened and in their original packaging. To initiate a return, please contact our customer service team.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink text-lg mb-2">Refunds</h2>
          <p>Refunds are processed within 5-7 business days after we receive the returned item. The refund will be issued to the original payment method.</p>
        </section>
      </div>
    </div>
  );
}
