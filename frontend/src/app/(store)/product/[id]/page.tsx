import NotesPyramid from "@/components/NotesPyramid";
import AddToCartButton from "./AddToCartButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getProduct(id: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    const res = await fetch(`${base}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} — Inspired by Nature`,
    description: `${product.title} — premium fragrance at ₨ ${product.price.toLocaleString()}`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return <div className="text-center py-16">Product not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-shade-20 rounded-md overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-shade-40">No image</div>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-2xl font-bold mb-6">₨ {product.price.toLocaleString()}</p>
          <p className="text-sm text-shade-50 mb-6">Stock: {product.stock}</p>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Size / Concentration</h3>
              <div className="flex gap-2">
                {product.variants.map((v: any) => (
                  <button key={v.id} className="size-selector-pill-inactive">
                    {v.size || "Standard"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AddToCartButton product={product} />

          <NotesPyramid
            top={["Bergamot", "Lemon", "Orange Blossom"]}
            middle={["Jasmine", "Rose", "Lavender"]}
            base={["Sandalwood", "Musk", "Vanilla"]}
          />
        </div>
      </div>
    </div>
  );
}
