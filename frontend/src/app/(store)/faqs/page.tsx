export default function FAQsPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {[
          { q: "How long does a fragrance last?", a: "Longevity depends on concentration. Eau de Parfum (EDP) typically lasts 6-8 hours, Eau de Toilette (EDT) 3-5 hours, and Parfum extracts can last 8-12 hours." },
          { q: "What's the difference between EDT, EDP, and Parfum?", a: "The difference is the concentration of fragrance oils. EDT has 5-15%, EDP has 15-20%, and Parfum has 20-30%. Higher concentration means longer lasting and more intense scent." },
          { q: "Do you offer samples?", a: "Yes, we offer sample sets of our most popular fragrances so you can try before committing to a full bottle." },
          { q: "How should I store my perfume?", a: "Store in a cool, dark place away from direct sunlight and temperature fluctuations. Avoid bathrooms due to humidity." },
          { q: "What is your return policy?", a: "We accept returns within 14 days of delivery for unopened products in their original packaging." },
        ].map((faq, i) => (
          <div key={i}>
            <h3 className="font-semibold mb-1">{faq.q}</h3>
            <p className="text-sm text-shade-50">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
