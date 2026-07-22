export default function FragranceGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Fragrance Guide</h1>
      <div className="space-y-6 text-shade-60">
        <section>
          <h2 className="font-semibold text-ink text-xl mb-3">EDT vs EDP vs Parfum</h2>
          <p className="text-sm">The main difference is the concentration of fragrance oils. Eau de Toilette (EDT) contains 5-15% oils and lasts 3-5 hours. Eau de Parfum (EDP) contains 15-20% oils and lasts 6-8 hours. Parfum contains 20-30% oils and can last 8-12 hours or more.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink text-xl mb-3">Fragrance Families</h2>
          <p className="text-sm">Fragrances are categorized into families: Floral (rose, jasmine), Oriental (vanilla, amber), Woody (sandalwood, cedar), and Fresh (citrus, aquatic). Most perfumes blend multiple families.</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink text-xl mb-3">The Notes Pyramid</h2>
          <p className="text-sm">Every fragrance has three layers: Top notes (first impression, lasts 15-30 min), Heart notes (the core scent, lasts 2-4 hours), and Base notes (the foundation, lasts 6+ hours).</p>
        </section>
        <section>
          <h2 className="font-semibold text-ink text-xl mb-3">Layering Tips</h2>
          <p className="text-sm">You can layer fragrances by starting with a base scent and adding complementary notes. For example, a vanilla base pairs beautifully with floral or citrus top notes.</p>
        </section>
      </div>
    </div>
  );
}
