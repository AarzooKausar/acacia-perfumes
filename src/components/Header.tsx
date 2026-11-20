import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { CollectionFilter, PageRoute } from "../types";

interface HeaderProps {
  currentPage: PageRoute;
  activeFilter: CollectionFilter;
  cartCount: number;
  onNavigate: (page: PageRoute, filter?: CollectionFilter) => void;
  onOpenCart: () => void;
}

export function Header({
  currentPage,
  activeFilter,
  cartCount,
  onNavigate,
  onOpenCart,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: {
    label: string;
    page: PageRoute;
    filter?: CollectionFilter;
    isActive: boolean;
  }[] = [
    {
      label: "Home",
      page: "home",
      isActive: currentPage === "home",
    },
    {
      label: "Shop",
      page: "shop",
      filter: "All",
      isActive:
        currentPage === "shop" &&
        activeFilter !== "Men" &&
        activeFilter !== "Women",
    },
    {
      label: "Men",
      page: "shop",
      filter: "Men",
      isActive: currentPage === "shop" && activeFilter === "Men",
    },
    {
      label: "Women",
      page: "shop",
      filter: "Women",
      isActive: currentPage === "shop" && activeFilter === "Women",
    },
    {
      label: "About Us",
      page: "about",
      isActive: currentPage === "about",
    },
    {
      label: "Contact",
      page: "contact",
      isActive: currentPage === "contact",
    },
    {
      label: "Admin",
      page: "admin",
      isActive: currentPage === "admin",
    },
  ];

  const handleNavClick = (page: PageRoute, filter?: CollectionFilter) => {
    setMobileOpen(false);
    onNavigate(page, filter);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#0E0D0C]/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 -ml-2 text-[#0E0D0C] hover:text-[#9E7B36] transition-colors focus-visible:outline-2 focus-visible:outline-[#C5A059]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={() => handleNavClick("home")}
            className="font-display text-2xl sm:text-[26px] font-semibold tracking-[0.22em] text-[#0E0D0C] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C5A059]"
          >
            ACACIA
          </button>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-7"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.page, item.filter)}
              className={`relative py-1 text-[13px] tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#C5A059] ${
                item.isActive
                  ? "text-[#0E0D0C] font-semibold"
                  : "text-[#6E655B] hover:text-[#0E0D0C] font-medium"
              }`}
            >
              {item.label}
              <span
                className={`absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#C5A059] transition-transform duration-200 origin-left ${
                  item.isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action (Shopping Bag) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium tracking-[0.04em] bg-[#0E0D0C] text-[#FAF8F4] hover:bg-[#24211D] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#C5A059]"
          >
            <ShoppingBag className="w-4 h-4 text-[#C5A059]" strokeWidth={1.75} />
            <span>Bag</span>
            <span className="tabular-nums text-[#C5A059] font-semibold">
              ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#0E0D0C]/10 bg-[#FAF8F4] px-5 py-4">
          <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.page, item.filter)}
                className={`w-full text-left py-2.5 px-3 text-sm tracking-[0.04em] transition-colors ${
                  item.isActive
                    ? "bg-[#EDE6DA] text-[#0E0D0C] font-semibold"
                    : "text-[#6E655B] hover:text-[#0E0D0C] hover:bg-[#EDE6DA]/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
