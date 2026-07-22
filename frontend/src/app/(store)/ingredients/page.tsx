export default function IngredientsPage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Ingredients & Allergens</h1>
      <div className="space-y-4 text-sm text-shade-60">
        <p>We believe in transparency. Below are the common ingredients found in our fragrances.</p>
        <h2 className="font-semibold text-ink text-lg mt-6">Common Ingredients</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Denatured Alcohol (SD Alcohol 40-B)</li>
          <li>Fragrance/Parfum (essential oil blend)</li>
          <li>Water/Aqua</li>
          <li>Limonene</li>
          <li>Linalool</li>
          <li>Citronellol</li>
          <li>Geraniol</li>
          <li>Coumarin</li>
        </ul>
        <h2 className="font-semibold text-ink text-lg mt-6">Allergen Information</h2>
        <p>As required by EU regulations, we list all potential allergens. Our products may contain allergens naturally present in essential oils. If you have specific allergies, please contact us for detailed ingredient lists for individual products.</p>
        <h2 className="font-semibold text-ink text-lg mt-6">Our Commitment</h2>
        <p>All our fragrances are cruelty-free. We use sustainably sourced ingredients whenever possible. Our products are free from parabens and phthalates.</p>
      </div>
    </div>
  );
}
