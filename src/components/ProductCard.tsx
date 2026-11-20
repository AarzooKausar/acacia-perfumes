import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { BottleSize, Product } from "../types";
import {
  formatPKR,
  getCollectionSummary,
  getPriceForSize,
  parseSizes,
} from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: BottleSize, quantity: number) => void;
}

export function ProductCard({
  product,
  onSelectProduct,
  onAddToCart,
}: ProductCardProps) {
  const availableSizes = parseSizes(product.sizes);
  const defaultSize: BottleSize = availableSizes.includes("50ml")
    ? "50ml"
    : availableSizes[0];
  const [selectedSize, setSelectedSize] = useState<BottleSize>(defaultSize);
  const [justAdded, setJustAdded] = useState(false);

  const currentPrice = getPriceForSize(product.price_pkr, selectedSize);
  const inStock = product.stock > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    onAddToCart(product, selectedSize, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article className="group flex flex-col bg-white border border-[#0E0D0C]/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_rgba(14,13,12,0.14)]">
      {/* Product Image */}
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#EDE6DA] text-left focus-visible:outline-2 focus-visible:outline-[#C5A059]"
      >
        <LuxuryImage
          src={product.image_url}
          alt={`${product.name} luxury perfume bottle`}
          fallbackTitle={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </button>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Clean unboxed metadata */}
        <div className="flex items-center justify-between gap-2 text-[11px] tracking-[0.12em] uppercase text-[#6E655B]">
          <span className="truncate">{getCollectionSummary(product)}</span>
          <span
            className={`shrink-0 font-medium ${
              !inStock
                ? "text-[#8B3A3A]"
                : product.stock <= 5
                ? "text-[#9E7B36]"
                : "text-[#6E655B]"
            }`}
          >
            {!inStock
              ? "Sold Out"
              : product.stock <= 5
              ? `${product.stock} Left`
              : "In Stock"}
          </span>
        </div>

        {/* Title & Price */}
        <div className="mt-2.5 flex items-baseline justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelectProduct(product)}
            className="text-left font-display text-[22px] leading-snug font-semibold text-[#0E0D0C] hover:text-[#9E7B36] transition-colors"
          >
            {product.name}
          </button>
          <span className="text-[15px] font-semibold tabular-nums text-[#0E0D0C] whitespace-nowrap shrink-0">
            {formatPKR(currentPrice)}
          </span>
        </div>

        {/* Short description */}
        <p className="mt-2 text-[13.5px] leading-relaxed text-[#6E655B] line-clamp-2">
          {product.description}
        </p>

        {/* Size selector + Add to Cart */}
        <div className="mt-auto pt-5 border-t border-[#0E0D0C]/8 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] tracking-[0.08em] uppercase text-[#6E655B]">
              Bottle Size
            </span>
            <div className="flex items-center gap-1" role="group" aria-label={`Select size for ${product.name}`}>
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 text-xs tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                    selectedSize === sz
                      ? "bg-[#0E0D0C] text-[#FAF8F4] font-medium"
                      : "bg-[#FAF8F4] text-[#6E655B] hover:text-[#0E0D0C] border border-[#0E0D0C]/12"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!inStock}
            onClick={handleAdd}
            className={`w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 text-[13px] font-medium tracking-[0.05em] transition-colors duration-150 whitespace-nowrap shrink-0 ${
              !inStock
                ? "bg-[#EDE6DA] text-[#6E655B] cursor-not-allowed"
                : justAdded
                ? "bg-[#9E7B36] text-[#FAF8F4]"
                : "bg-[#0E0D0C] text-[#FAF8F4] hover:bg-[#26231F]"
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </>
            ) : !inStock ? (
              <span>Currently Unavailable</span>
            ) : (
              <>
                <Plus className="w-4 h-4 text-[#C5A059]" />
                <span>Add to Cart — {selectedSize}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
