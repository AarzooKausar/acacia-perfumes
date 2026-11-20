import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BottleSize, CollectionFilter, Product } from "../types";
import { ProductCard } from "./ProductCard";

interface ShopViewProps {
  products: Product[];
  activeFilter: CollectionFilter;
  onFilterChange: (filter: CollectionFilter) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: BottleSize, quantity: number) => void;
}

const FILTER_TABS: { label: string; value: CollectionFilter }[] = [
  { label: "All Perfumes", value: "All" },
  { label: "Men's Perfumes", value: "Men" },
  { label: "Women's Perfumes", value: "Women" },
  { label: "Unisex Perfumes", value: "Unisex" },
  { label: "Luxury Collection", value: "Luxury" },
  { label: "Best Sellers", value: "Best Sellers" },
];

export function ShopView({
  products,
  activeFilter,
  onFilterChange,
  onSelectProduct,
  onAddToCart,
}: ShopViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">(
    "featured"
  );

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = products.filter((p) => {
      if (activeFilter === "Men" && p.category !== "Men") return false;
      if (activeFilter === "Women" && p.category !== "Women") return false;
      if (activeFilter === "Unisex" && p.category !== "Unisex") return false;
      if (activeFilter === "Luxury" && p.is_luxury !== 1) return false;
      if (activeFilter === "Best Sellers" && p.is_bestseller !== 1) return false;

      if (q) {
        const hay =
          `${p.name} ${p.description} ${p.top_notes} ${p.middle_notes} ${p.base_notes} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => a.price_pkr - b.price_pkr);
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => b.price_pkr - a.price_pkr);
    }
    return list;
  }, [products, activeFilter, searchTerm, sortBy]);

  const activeHeading =
    FILTER_TABS.find((t) => t.value === activeFilter)?.label || "Fragrance Catalogue";

  return (
    <section className="bg-[#FAF8F4] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Page Header */}
        <div className="pb-8 border-b border-[#0E0D0C]/10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
              ACACIA Olfactory Library
            </p>
            <h1 className="mt-1.5 font-display text-4xl sm:text-5xl font-medium text-[#0E0D0C]">
              {activeHeading}
            </h1>
            <p className="mt-2 text-sm text-[#6E655B]">
              Showing <span className="tabular-nums font-medium text-[#0E0D0C]">{filteredProducts.length}</span> fine fragrances available in 30ml, 50ml, and 100ml flacons.
            </p>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6E655B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes or scents..."
                aria-label="Search perfumes"
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] placeholder:text-[#6E655B] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort fragrances"
              className="px-4 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Collection Filter Bar */}
        <div
          className="py-5 flex items-center gap-2 overflow-x-auto border-b border-[#0E0D0C]/8"
          role="tablist"
          aria-label="Fragrance collections"
        >
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(tab.value)}
                className={`px-4 py-2 text-xs font-medium tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? "bg-[#0E0D0C] text-[#FAF8F4]"
                    : "bg-[#EDE6DA]/70 text-[#6E655B] hover:text-[#0E0D0C] hover:bg-[#EDE6DA]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-[#0E0D0C]">
              No fragrances matched your filter.
            </p>
            <p className="mt-2 text-sm text-[#6E655B]">
              Try clearing your search query or viewing our complete collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                onFilterChange("All");
              }}
              className="mt-6 px-6 py-2.5 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-medium tracking-[0.12em] uppercase"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
