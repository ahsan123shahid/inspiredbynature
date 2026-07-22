import ProductCard from "@/components/ProductCard";

type PageProps = {
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    search?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
    page?: string;
  }>;
};

async function getProducts(searchParams: Record<string, string | undefined>) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category_id", searchParams.category);
  if (searchParams.subcategory) params.set("subcategory_id", searchParams.subcategory);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.min_price) params.set("min_price", searchParams.min_price);
  if (searchParams.max_price) params.set("max_price", searchParams.max_price);
  if (searchParams.page) params.set("page", searchParams.page);

  try {
    const res = await fetch(`${base}/products?${params.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { items: [], total: 0, page: 1, pages: 1 };
    return res.json();
  } catch {
    return { items: [], total: 0, page: 1, pages: 1 };
  }
}

export async function generateMetadata({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = sp.search;
  return {
    title: q ? `Search: ${q} — Inspired by Nature` : "Shop Fragrances — Inspired by Nature",
    description: "Browse our collection of premium fragrances, attars, and perfumes.",
  };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { items: products, total, page, pages } = await getProducts(sp);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{sp.search ? `Search: "${sp.search}"` : "All Fragrances"}</h1>
      <p className="text-sm text-shade-50 mb-6">{total} products found</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p: any) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/shop?page=${p}`}
              className={`px-4 py-2 text-sm rounded-sm ${p === page ? "bg-ink text-on-primary" : "bg-shade-20 hover:bg-shade-30"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
