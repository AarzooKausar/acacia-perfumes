import { CollectionFilter, PageRoute } from "../types";

interface FooterProps {
  onNavigate: (page: PageRoute, filter?: CollectionFilter) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#0E0D0C] text-[#FAF8F4] border-t border-[#C5A059]/20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-4">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="font-display text-3xl tracking-[0.22em] font-semibold text-[#FAF8F4]"
            >
              ACACIA
            </button>
            <p className="mt-4 text-sm leading-relaxed text-[#FAF8F4]/70 max-w-sm">
              Fine fragrances composed with aged woods, rare blossoms, and cold-pressed botanicals. Designed for quiet confidence and unforgettable presence.
            </p>
            <p className="mt-4 text-xs text-[#C5A059] tracking-wide">
              concierge@acaciaparfums.com · +92 21 3584 0912
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-sans text-xs font-semibold tracking-[0.14em] uppercase text-[#C5A059] mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF8F4]/75">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "Men")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Men&apos;s Perfumes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "Women")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Women&apos;s Perfumes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "Unisex")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Unisex Perfumes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "Luxury")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Luxury Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("shop", "Best Sellers")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Best Sellers
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-sans text-xs font-semibold tracking-[0.14em] uppercase text-[#C5A059] mb-4">
              The House
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF8F4]/75">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("about")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  About ACACIA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("contact")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Contact Concierge
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("checkout")}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Cash on Delivery Checkout
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate("admin")}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Admin Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-sans text-xs font-semibold tracking-[0.14em] uppercase text-[#C5A059] mb-4">
              Follow
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FAF8F4]/75">
              <li>
                <a
                  href="#instagram"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("contact");
                  }}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#facebook"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("contact");
                  }}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#pinterest"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate("contact");
                  }}
                  className="hover:text-[#FAF8F4] transition-colors"
                >
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F4]/55">
          <p>© {new Date().getFullYear()} ACACIA Parfums. All rights reserved.</p>
          <p>Complimentary delivery across Pakistan on orders above PKR 15,000.</p>
        </div>
      </div>
    </footer>
  );
}
