import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { BottleSize, CollectionFilter, PageRoute, Product } from "../types";
import { HERO_CAMPAIGN_IMAGE } from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";
import { ProductCard } from "./ProductCard";

interface HomeViewProps {
  products: Product[];
  onNavigate: (page: PageRoute, filter?: CollectionFilter) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: BottleSize, quantity: number) => void;
}

const FEATURED_COLLECTIONS: {
  title: string;
  subtitle: string;
  filter: CollectionFilter;
}[] = [
  {
    title: "Men's Perfumes",
    subtitle: "Smoked woods, spiced saffron & dark vetiver",
    filter: "Men",
  },
  {
    title: "Women's Perfumes",
    subtitle: "Damask rose, night jasmine & Florentine iris",
    filter: "Women",
  },
  {
    title: "Unisex Perfumes",
    subtitle: "Velvet sandalwood, amber resin & skin musk",
    filter: "Unisex",
  },
  {
    title: "Luxury Collection",
    subtitle: "Reserve extraits aged in small numbered batches",
    filter: "Luxury",
  },
  {
    title: "Best Sellers",
    subtitle: "Our most sought-after signature compositions",
    filter: "Best Sellers",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Oud Al-Qamar has become my unmistakable evening signature. Even ten hours after application, the saffron and aged sandalwood linger effortlessly on wool and silk.",
    author: "Tariq Mahmood",
    detail: "Architect, Islamabad · Wears Oud Al-Qamar 100ml",
  },
  {
    quote:
      "Fleur de Nuit feels luminous without ever becoming sweet or overwhelming. The packaging arrived sealed in heavy linen and the Cash on Delivery service was seamless.",
    author: "Ayesha Humayun",
    detail: "Creative Director, Lahore · Wears Fleur de Nuit 50ml",
  },
  {
    quote:
      "I gifted Santal Velours to my husband and immediately ordered a second bottle for myself. Balanced, warm, and genuinely comparable to heritage Parisian houses.",
    author: "Sana Raza",
    detail: "Gallery Curator, Karachi · Wears Santal Velours 50ml",
  },
];

export function HomeView({
  products,
  onNavigate,
  onSelectProduct,
  onAddToCart,
}: HomeViewProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [newsletterError, setNewsletterError] = useState("");

  const bestSellers = products
    .filter((p) => p.is_bestseller === 1)
    .slice(0, 6);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("submitting");
    setNewsletterError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Subscription failed");
      }
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch (err: any) {
      setNewsletterStatus("error");
      setNewsletterError(err.message || "Unable to subscribe right now.");
    }
  };

  return (
    <div>
      {/* 1. Luxury Campaign Hero */}
      <section className="relative bg-[#0E0D0C] text-[#FAF8F4] overflow-hidden">
        <div className="relative min-h-[540px] lg:min-h-[640px] flex items-center">
          <div className="absolute inset-0">
            <LuxuryImage
              src={HERO_CAMPAIGN_IMAGE}
              alt="ACACIA luxury dark glass perfume flacon with champagne gold cap"
              fallbackTitle="ACACIA"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0E0D0C]/90 via-[#0E0D0C]/60 to-[#0E0D0C]/25" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto w-full px-5 sm:px-8 py-20 lg:py-28">
            <div className="max-w-xl">
              <p className="text-xs tracking-[0.22em] uppercase text-[#C5A059] font-medium mb-4">
                Maison de Parfum · Small-Batch Extraits
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl lg:text-[62px] font-medium leading-[1.06] tracking-[-0.01em] text-[#FAF8F4]"
                style={{ textWrap: "balance" }}
              >
                Discover Your Signature Scent.
              </h1>
              <p className="mt-5 text-lg sm:text-xl font-display italic text-[#EDE6DA] tracking-wide">
                Elegance in Every Drop.
              </p>
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-[#FAF8F4]/80 max-w-md">
                Composed with rare aged oud, Damask rose, and warm ambergris for enduring presence across every hour.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "All")}
                  className="inline-flex items-center gap-3 px-7 py-3.5 bg-[#C5A059] text-[#0E0D0C] text-[13px] font-semibold tracking-[0.12em] uppercase hover:bg-[#D4B370] transition-colors duration-150 whitespace-nowrap shrink-0"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "Luxury")}
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#FAF8F4]/35 text-[#FAF8F4] text-[13px] font-medium tracking-[0.1em] uppercase hover:border-[#C5A059] hover:text-[#C5A059] transition-colors duration-150 whitespace-nowrap shrink-0"
                >
                  Explore Luxury Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Perfume Collections */}
      <section className="bg-[#FAF8F4] border-b border-[#0E0D0C]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
                Curated Houses
              </p>
              <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium text-[#0E0D0C]">
                Featured Collections
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("shop", "All")}
              className="inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase font-semibold text-[#0E0D0C] hover:text-[#9E7B36] transition-colors self-start sm:self-auto"
            >
              <span>View Full Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURED_COLLECTIONS.map((col, idx) => (
              <button
                key={col.title}
                type="button"
                onClick={() => onNavigate("shop", col.filter)}
                className="group text-left p-5 bg-[#EDE6DA]/60 hover:bg-[#0E0D0C] border border-[#0E0D0C]/10 transition-colors duration-200 flex flex-col justify-between min-h-[144px]"
              >
                <span className="text-[11px] tabular-nums tracking-[0.18em] text-[#9E7B36] group-hover:text-[#C5A059]">
                  0{idx + 1}
                </span>
                <div className="mt-4">
                  <h3 className="font-display text-xl font-semibold text-[#0E0D0C] group-hover:text-[#FAF8F4] transition-colors">
                    {col.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6E655B] group-hover:text-[#FAF8F4]/70 transition-colors">
                    {col.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Best-Selling Products */}
      <section className="bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
                Signature Creations
              </p>
              <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium text-[#0E0D0C]">
                Best-Selling Fragrances
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("shop", "Best Sellers")}
              className="inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase font-semibold text-[#0E0D0C] hover:text-[#9E7B36] transition-colors self-start sm:self-auto"
            >
              <span>Shop All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Customer Testimonials */}
      <section className="bg-[#EDE6DA]/70 border-y border-[#0E0D0C]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-xl mb-10">
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
              Patron Notes
            </p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-medium text-[#0E0D0C]">
              Voices of Confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {TESTIMONIALS.map((item) => (
              <blockquote
                key={item.author}
                className="bg-[#FAF8F4] border border-[#0E0D0C]/10 p-7 flex flex-col justify-between"
              >
                <p className="text-[14.5px] leading-relaxed text-[#0E0D0C]/85 font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-6 pt-4 border-t border-[#0E0D0C]/10">
                  <div className="font-display text-lg font-semibold text-[#0E0D0C]">
                    {item.author}
                  </div>
                  <div className="text-xs text-[#6E655B] mt-0.5">
                    {item.detail}
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Newsletter Subscription */}
      <section className="bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="bg-[#0E0D0C] text-[#FAF8F4] px-6 py-12 sm:px-12 sm:py-14 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-lg">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#C5A059] font-semibold">
                Private Invitations
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-medium text-[#FAF8F4]">
                Receive Seasonal Editions First
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[#FAF8F4]/70">
                Join the ACACIA ledger for limited Reserve releases, private atelier previews, and botanical notes.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              {newsletterStatus === "success" ? (
                <div className="flex items-center gap-3 p-4 bg-[#1C1A17] border border-[#C5A059]/40 text-sm text-[#FAF8F4]">
                  <Check className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>
                    Welcome to ACACIA. Your address has been added to our private dispatch.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 bg-[#1C1A17] border border-white/15 text-sm text-[#FAF8F4] placeholder:text-[#FAF8F4]/45 focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === "submitting"}
                    className="px-6 py-3 bg-[#C5A059] text-[#0E0D0C] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#D4B370] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    {newsletterStatus === "submitting"
                      ? "Joining..."
                      : "Subscribe"}
                  </button>
                </form>
              )}
              {newsletterStatus === "error" && (
                <p className="mt-2 text-xs text-red-300">{newsletterError}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
