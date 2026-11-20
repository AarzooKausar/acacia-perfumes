import { useState } from "react";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { BottleSize, Product } from "../types";
import {
  formatPKR,
  getCollectionSummary,
  getPriceForSize,
  parseSizes,
} from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size: BottleSize, quantity: number) => void;
  onBuyNow: (product: Product, size: BottleSize, quantity: number) => void;
}

export function ProductDetailView({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
}: ProductDetailViewProps) {
  const sizes = parseSizes(product.sizes);
  const [selectedSize, setSelectedSize] = useState<BottleSize>(
    sizes.includes("50ml") ? "50ml" : sizes[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const unitPrice = getPriceForSize(product.price_pkr, selectedSize);
  const inStock = product.stock > 0;
  const maxQty = Math.max(1, product.stock);

  const handleAdd = () => {
    if (!inStock) return;
    onAddToCart(product, selectedSize, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1600);
  };

  return (
    <section className="bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase font-semibold text-[#6E655B] hover:text-[#0E0D0C] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Sticky Product Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#EDE6DA] border border-[#0E0D0C]/10">
              <LuxuryImage
                src={product.image_url}
                alt={`${product.name} luxury perfume flacon`}
                fallbackTitle={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-6">
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#9E7B36] font-semibold">
              {getCollectionSummary(product)}
            </p>

            <h1 className="mt-2 font-display text-4xl sm:text-5xl font-medium text-[#0E0D0C]">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-4 pb-6 border-b border-[#0E0D0C]/10">
              <span className="text-2xl font-semibold tabular-nums text-[#0E0D0C]">
                {formatPKR(unitPrice)}
              </span>
              <span className="text-xs text-[#6E655B]">
                for {selectedSize} Eau de Parfum
              </span>
              <span
                className={`ml-auto text-xs font-medium ${
                  inStock ? "text-[#0E0D0C]" : "text-[#8B3A3A]"
                }`}
              >
                {inStock
                  ? `In Stock (${product.stock} bottles available)`
                  : "Out of Stock"}
              </span>
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-[#0E0D0C]/85">
              {product.description}
            </p>

            {/* Fragrance Notes Pyramid */}
            <div className="mt-8 bg-[#EDE6DA]/60 border border-[#0E0D0C]/10 divide-y divide-[#0E0D0C]/10">
              <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <span className="text-[11px] tracking-[0.16em] uppercase font-semibold text-[#9E7B36] shrink-0">
                  Top Notes
                </span>
                <span className="text-sm text-[#0E0D0C] sm:text-right">
                  {product.top_notes}
                </span>
              </div>
              <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <span className="text-[11px] tracking-[0.16em] uppercase font-semibold text-[#9E7B36] shrink-0">
                  Middle Notes
                </span>
                <span className="text-sm text-[#0E0D0C] sm:text-right">
                  {product.middle_notes}
                </span>
              </div>
              <div className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                <span className="text-[11px] tracking-[0.16em] uppercase font-semibold text-[#9E7B36] shrink-0">
                  Base Notes
                </span>
                <span className="text-sm text-[#0E0D0C] sm:text-right">
                  {product.base_notes}
                </span>
              </div>
            </div>

            {/* Bottle Size Selector */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs tracking-[0.14em] uppercase font-semibold text-[#0E0D0C]">
                  Select Bottle Size
                </span>
                <span className="text-xs text-[#6E655B]">
                  Concentration: Extrait de Parfum
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sizes.map((size) => {
                  const sizePrice = getPriceForSize(product.price_pkr, size);
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`p-3.5 text-left border transition-colors ${
                        active
                          ? "bg-[#0E0D0C] text-[#FAF8F4] border-[#0E0D0C]"
                          : "bg-white text-[#0E0D0C] border-[#0E0D0C]/15 hover:border-[#C5A059]"
                      }`}
                    >
                      <div className="text-sm font-semibold tabular-nums">
                        {size}
                      </div>
                      <div
                        className={`text-xs tabular-nums mt-0.5 ${
                          active ? "text-[#C5A059]" : "text-[#6E655B]"
                        }`}
                      >
                        {formatPKR(sizePrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch gap-3">
              <div className="inline-flex items-center justify-between border border-[#0E0D0C]/20 bg-white px-2 h-12 sm:w-36 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-2 text-[#0E0D0C] hover:text-[#9E7B36] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold tabular-nums text-[#0E0D0C]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  aria-label="Increase quantity"
                  className="p-2 text-[#0E0D0C] hover:text-[#9E7B36] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!inStock}
                onClick={handleAdd}
                className={`flex-1 h-12 px-6 inline-flex items-center justify-center gap-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-colors ${
                  !inStock
                    ? "bg-[#EDE6DA] text-[#6E655B] cursor-not-allowed"
                    : addedFeedback
                    ? "bg-[#9E7B36] text-[#FAF8F4]"
                    : "bg-[#0E0D0C] text-[#FAF8F4] hover:bg-[#26231F]"
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                    <span>
                      Add to Cart · {formatPKR(unitPrice * quantity)}
                    </span>
                  </>
                )}
              </button>
            </div>

            {inStock && (
              <button
                type="button"
                onClick={() => onBuyNow(product, selectedSize, quantity)}
                className="mt-3 w-full h-11 border border-[#0E0D0C] text-[#0E0D0C] hover:bg-[#EDE6DA] text-xs font-semibold tracking-[0.14em] uppercase transition-colors"
              >
                Order Now with Cash on Delivery
              </button>
            )}

            <p className="mt-4 text-xs text-[#6E655B]">
              Complimentary gift box and nationwide delivery on orders above PKR 15,000.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
