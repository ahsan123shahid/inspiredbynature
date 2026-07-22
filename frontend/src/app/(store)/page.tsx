import Banner from "@/components/Banner";
import ProductCard from "@/components/ProductCard";

async function getProducts() {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${base}/products?size=8&sort=popularity`, { next: { revalidate: 60 } });
    if (!res.ok) return { items: [] };
    return res.json();
  } catch {
    return { items: [] };
  }
}

export default async function LandingPage() {
  const { items: products } = await getProducts();

  return (
    <div>
      <Banner
        slides={[
          {
            id: 1,
            desktopImage: "/hero-desktop.jpg",
            mobileImage: "/hero-mobile.jpg",
            title: "Signature Scents",
            subtitle: "inspired by nature",
            buttonText: "Explore Collection",
            buttonLink: "/shop",
          },
        ]}
      />

      <section className="py-16 px-8">
        <h2 className="section-title mb-10">Best Sellers</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      <section className="bg-surface-maroon text-on-primary py-16 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">The Art of Perfumery</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Every fragrance tells a story — from sun-drenched citrus groves to misty oud forests.
            Discover scents crafted from the finest natural ingredients.
          </p>
        </div>
      </section>
    </div>
  );
}
