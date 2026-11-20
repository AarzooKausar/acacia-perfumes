/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from "react";
import {
  BottleSize,
  CartItem,
  CollectionFilter,
  Order,
  PageRoute,
  Product,
} from "./types";
import { getPriceForSize } from "./lib/format";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomeView } from "./components/HomeView";
import { ShopView } from "./components/ShopView";
import { ProductDetailView } from "./components/ProductDetailView";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutView } from "./components/CheckoutView";
import { AboutView } from "./components/AboutView";
import { ContactView } from "./components/ContactView";
import { AdminDashboardView } from "./components/AdminDashboardView";

const CART_STORAGE_KEY = "acacia_perfumes_bag_v1";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageRoute>("home");
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(data);
        setSelectedProduct((prev) =>
          prev ? data.find((p) => p.id === prev.id) || prev : null
        );
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleNavigate = (page: PageRoute, filter?: CollectionFilter) => {
    setCurrentPage(page);
    if (filter !== undefined) {
      setActiveFilter(filter);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (
    product: Product,
    size: BottleSize,
    quantity: number
  ) => {
    const unitPrice = getPriceForSize(product.price_pkr, size);
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          product,
          quantity: Math.min(product.stock, next[idx].quantity + quantity),
        };
        return next;
      }
      return [...prev, { product, size, quantity, unitPrice }];
    });
  };

  const handleBuyNow = (
    product: Product,
    size: BottleSize,
    quantity: number
  ) => {
    handleAddToCart(product, size, quantity);
    setCurrentPage("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdateQuantity = (
    productId: number,
    size: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(item.product.stock || 99, nextQty),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: number, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const handleOrderSuccess = (_order: Order) => {
    setCart([]);
    fetchProducts();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#0E0D0C]">
      <Header
        currentPage={currentPage}
        activeFilter={activeFilter}
        cartCount={cartCount}
        onNavigate={handleNavigate}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        {loadingProducts && products.length === 0 ? (
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 text-center">
            <p className="font-display text-2xl text-[#6E655B]">
              Preparing the ACACIA fragrance library...
            </p>
          </div>
        ) : (
          <>
            {currentPage === "home" && (
              <HomeView
                products={products}
                onNavigate={handleNavigate}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentPage === "shop" && (
              <ShopView
                products={products}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onSelectProduct={handleSelectProduct}
                onAddToCart={handleAddToCart}
              />
            )}

            {currentPage === "product" && selectedProduct && (
              <ProductDetailView
                product={selectedProduct}
                onBack={() => handleNavigate("shop")}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            )}

            {currentPage === "checkout" && (
              <CheckoutView
                cartItems={cart}
                products={products}
                onOrderSuccess={handleOrderSuccess}
                onBackToShop={() => handleNavigate("shop", "All")}
              />
            )}

            {currentPage === "about" && (
              <AboutView onNavigate={handleNavigate} />
            )}

            {currentPage === "contact" && <ContactView />}

            {currentPage === "admin" && (
              <AdminDashboardView
                products={products}
                onRefreshProducts={fetchProducts}
              />
            )}
          </>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <CartDrawer
        isOpen={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setCartOpen(false);
          handleNavigate("checkout");
        }}
        onBrowseShop={() => handleNavigate("shop", "All")}
      />
    </div>
  );
}
