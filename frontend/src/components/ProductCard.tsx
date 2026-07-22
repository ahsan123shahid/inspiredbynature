import Link from "next/link";
import clsx from "clsx";

type ProductCardProps = {
  id: number;
  title: string;
  image?: string | null;
  price: number;
  comparePrice?: number;
  category?: string;
  className?: string;
};

export default function ProductCard({ id, title, image, price, comparePrice, category, className }: ProductCardProps) {
  const hasDiscount = comparePrice && comparePrice > price;

  return (
    <Link href={`/product/${id}`} className={clsx("group block", className)}>
      <div className="bg-canvas rounded-md overflow-hidden">
        <div className="aspect-square bg-shade-20 relative">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-shade-40 text-xs">No image</div>
          )}
          {hasDiscount && (
            <span className="absolute top-2 left-2 badge-discount">
              -{Math.round(((comparePrice - price) / comparePrice) * 100)}%
            </span>
          )}
        </div>
        <div className="pt-3 pb-2">
          {category && <p className="text-product-caption text-shade-50 mb-0.5">{category}</p>}
          <h3 className="text-product-title font-semibold truncate">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-price-current font-bold">₨ {price.toLocaleString()}</span>
            {comparePrice && <span className="text-price-strike text-sm line-through">₨ {comparePrice.toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
