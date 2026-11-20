import { Minus, Plus, Trash2, X } from "lucide-react";
import { CartItem } from "../types";
import {
  formatPKR,
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
} from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: number, size: string, delta: number) => void;
  onRemoveItem: (productId: number, size: string) => void;
  onProceedToCheckout: () => void;
  onBrowseShop: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onBrowseShop,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : STANDARD_DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        className="fixed inset-0 bg-[#0E0D0C]/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="relative z-10 w-full max-w-md bg-[#FAF8F4] text-[#0E0D0C] h-full flex flex-col border-l border-[#0E0D0C]/15 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#0E0D0C]/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-medium text-[#0E0D0C]">
              Shopping Bag
            </h2>
            <p className="text-xs text-[#6E655B] tabular-nums mt-0.5">
              {items.reduce((acc, i) => acc + i.quantity, 0)} item(s) selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-2 text-[#6E655B] hover:text-[#0E0D0C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <p className="font-display text-2xl text-[#0E0D0C]">
                Your bag is currently empty.
              </p>
              <p className="mt-2 text-sm text-[#6E655B] max-w-xs">
                Explore our signature oud, floral, and sandalwood extraits to find your scent.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBrowseShop();
                }}
                className="mt-6 px-6 py-3 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#26231F] transition-colors"
              >
                Explore Fragrances
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#0E0D0C]/10">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.size}`}
                  className="py-5 first:pt-0 flex gap-4"
                >
                  <div className="w-20 h-20 bg-[#EDE6DA] shrink-0 overflow-hidden border border-[#0E0D0C]/10">
                    <LuxuryImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      fallbackTitle={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-[#0E0D0C] leading-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-[#6E655B] mt-0.5">
                          {item.product.category} · {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          onRemoveItem(item.product.id, item.size)
                        }
                        aria-label={`Remove ${item.product.name}`}
                        className="p-1 text-[#6E655B] hover:text-[#8B3A3A] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[#0E0D0C]/15 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.size, -1)
                          }
                          aria-label="Decrease quantity"
                          className="p-1.5 text-[#0E0D0C] hover:bg-[#EDE6DA] transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.size, 1)
                          }
                          aria-label="Increase quantity"
                          className="p-1.5 text-[#0E0D0C] hover:bg-[#EDE6DA] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold tabular-nums text-[#0E0D0C]">
                        {formatPKR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Summary Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#0E0D0C]/10 bg-[#EDE6DA]/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#6E655B]">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-[#0E0D0C]">
                  {formatPKR(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-[#6E655B]">
                <span>Nationwide Delivery</span>
                <span className="tabular-nums font-medium text-[#0E0D0C]">
                  {deliveryFee === 0 ? "Complimentary" : formatPKR(deliveryFee)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <p className="text-[11px] text-[#9E7B36]">
                  Add {formatPKR(FREE_DELIVERY_THRESHOLD - subtotal)} more for complimentary delivery.
                </p>
              )}
              <div className="pt-3 border-t border-[#0E0D0C]/10 flex justify-between items-baseline">
                <span className="font-semibold text-[#0E0D0C]">Total</span>
                <span className="text-lg font-semibold tabular-nums text-[#0E0D0C]">
                  {formatPKR(total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="mt-5 w-full py-3.5 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#26231F] transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
