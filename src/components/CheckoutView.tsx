import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Minus, Plus } from "lucide-react";
import { BottleSize, CartItem, Order, Product } from "../types";
import {
  formatPKR,
  FREE_DELIVERY_THRESHOLD,
  getPriceForSize,
  parseSizes,
  STANDARD_DELIVERY_FEE,
} from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";

interface CheckoutViewProps {
  cartItems: CartItem[];
  products: Product[];
  onOrderSuccess: (order: Order) => void;
  onBackToShop: () => void;
}

export function CheckoutView({
  cartItems,
  products,
  onOrderSuccess,
  onBackToShop,
}: CheckoutViewProps) {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash on Delivery" | "Bank Transfer"
  >("Cash on Delivery");

  // Direct single-perfume fallback if user visits checkout with an empty cart
  const availableProducts = products.filter((p) => p.stock > 0);
  const [directProductId, setDirectProductId] = useState<number>(
    availableProducts[0]?.id || products[0]?.id || 0
  );
  const [directSize, setDirectSize] = useState<BottleSize>("50ml");
  const [directQty, setDirectQty] = useState<number>(1);

  useEffect(() => {
    if (!directProductId && products.length > 0) {
      setDirectProductId(availableProducts[0]?.id || products[0].id);
    }
  }, [products, availableProducts, directProductId]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const usingCart = cartItems.length > 0;
  const selectedDirectProduct =
    products.find((p) => p.id === Number(directProductId)) || products[0];

  const orderLines = usingCart
    ? cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        image_url: item.product.image_url,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }))
    : selectedDirectProduct
    ? [
        {
          product_id: selectedDirectProduct.id,
          product_name: selectedDirectProduct.name,
          image_url: selectedDirectProduct.image_url,
          size: directSize,
          quantity: directQty,
          unit_price: getPriceForSize(
            selectedDirectProduct.price_pkr,
            directSize
          ),
        },
      ]
    : [];

  const subtotal = orderLines.reduce(
    (sum, line) => sum + line.unit_price * line.quantity,
    0
  );
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : STANDARD_DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderLines.length === 0) {
      setErrorMsg("Please select at least one fragrance to place your order.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          email,
          phone,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          items: orderLines.map((line) => ({
            product_id: line.product_id,
            product_name: line.product_name,
            size: line.size,
            quantity: line.quantity,
            unit_price: line.unit_price,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to complete your order.");
      }
      setConfirmedOrder(data);
      onOrderSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while placing order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <section className="bg-[#FAF8F4] py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-5 sm:px-8">
          <div className="bg-white border border-[#0E0D0C]/15 p-8 sm:p-10">
            <div className="flex items-center gap-3 text-[#9E7B36]">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-xs tracking-[0.18em] uppercase font-semibold">
                Order Confirmed
              </span>
            </div>

            <h1 className="mt-3 font-display text-4xl font-medium text-[#0E0D0C]">
              Thank You, {confirmedOrder.customer_name}
            </h1>
            <p className="mt-2 text-sm text-[#6E655B]">
              Order <span className="font-mono font-medium text-[#0E0D0C]">{confirmedOrder.order_number}</span> has been recorded and is being prepared at our atelier.
            </p>

            <div className="mt-8 pt-6 border-t border-[#0E0D0C]/10 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6E655B]">Payment Method</span>
                <span className="font-medium text-[#0E0D0C]">
                  {confirmedOrder.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E655B]">Delivery Address</span>
                <span className="font-medium text-[#0E0D0C] text-right max-w-xs">
                  {confirmedOrder.delivery_address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E655B]">Contact Phone</span>
                <span className="font-medium text-[#0E0D0C] tabular-nums">
                  {confirmedOrder.phone}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#0E0D0C]/10">
              <h2 className="text-xs tracking-[0.14em] uppercase font-semibold text-[#6E655B] mb-3">
                Fragrances Ordered
              </h2>
              <ul className="space-y-2.5 text-sm">
                {confirmedOrder.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between text-[#0E0D0C]"
                  >
                    <span>
                      {item.product_name} ({item.size}) × {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatPKR(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-[#0E0D0C]/10 flex justify-between items-baseline">
                <span className="font-semibold text-[#0E0D0C]">
                  Total Payable ({confirmedOrder.payment_method})
                </span>
                <span className="text-xl font-semibold tabular-nums text-[#0E0D0C]">
                  {formatPKR(confirmedOrder.total_amount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToShop}
              className="mt-8 w-full py-3.5 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#26231F] transition-colors"
            >
              Continue Exploring ACACIA
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs tracking-[0.14em] uppercase font-semibold text-[#6E655B] hover:text-[#0E0D0C] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalogue</span>
        </button>

        <div className="pb-8 border-b border-[#0E0D0C]/10">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
            Private Order Dispatch
          </p>
          <h1 className="mt-1.5 font-display text-4xl sm:text-5xl font-medium text-[#0E0D0C]">
            Checkout
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="pt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start"
        >
          {/* Left: Customer & Delivery Form */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white border border-[#0E0D0C]/10 p-6 sm:p-8 space-y-5">
              <h2 className="font-display text-2xl font-medium text-[#0E0D0C]">
                Client &amp; Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                  >
                    Customer Name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Bilal Ahmed"
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-email"
                    className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="bilal@example.com"
                    className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                >
                  Delivery Address
                </label>
                <textarea
                  id="checkout-address"
                  required
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House/Apartment number, street, sector/phase, and city"
                  className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {/* Direct Fragrance Selector if Bag is Empty */}
            {!usingCart && selectedDirectProduct && (
              <div className="bg-white border border-[#0E0D0C]/10 p-6 sm:p-8 space-y-5">
                <h2 className="font-display text-2xl font-medium text-[#0E0D0C]">
                  Select Fragrance &amp; Quantity
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="direct-perfume"
                      className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                    >
                      Selected Perfume
                    </label>
                    <select
                      id="direct-perfume"
                      value={directProductId}
                      onChange={(e) =>
                        setDirectProductId(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.name} ({p.category}){p.stock <= 0 ? " — Sold Out" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="direct-size"
                      className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2"
                    >
                      Bottle Size
                    </label>
                    <select
                      id="direct-size"
                      value={directSize}
                      onChange={(e) =>
                        setDirectSize(e.target.value as BottleSize)
                      }
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#0E0D0C]/15 text-sm text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                    >
                      {parseSizes(selectedDirectProduct.sizes).map((sz) => (
                        <option key={sz} value={sz}>
                          {sz} —{" "}
                          {formatPKR(
                            getPriceForSize(selectedDirectProduct.price_pkr, sz)
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-2">
                    Quantity
                  </span>
                  <div className="inline-flex items-center border border-[#0E0D0C]/15 bg-[#FAF8F4]">
                    <button
                      type="button"
                      onClick={() => setDirectQty((q) => Math.max(1, q - 1))}
                      className="p-3 text-[#0E0D0C] hover:bg-[#EDE6DA]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 text-sm font-semibold tabular-nums">
                      {directQty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDirectQty((q) =>
                          Math.min(
                            Math.max(1, selectedDirectProduct.stock),
                            q + 1
                          )
                        )
                      }
                      className="p-3 text-[#0E0D0C] hover:bg-[#EDE6DA]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white border border-[#0E0D0C]/10 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-medium text-[#0E0D0C] mb-4">
                Payment Method
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`cursor-pointer p-4 border transition-colors flex flex-col gap-1 ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-[#0E0D0C] bg-[#EDE6DA]/60"
                      : "border-[#0E0D0C]/15 bg-[#FAF8F4] hover:border-[#C5A059]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === "Cash on Delivery"}
                      onChange={() => setPaymentMethod("Cash on Delivery")}
                      className="accent-[#0E0D0C]"
                    />
                    <span className="text-sm font-semibold text-[#0E0D0C]">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-xs text-[#6E655B] pl-6">
                    Pay in cash upon sealed courier delivery at your doorstep.
                  </p>
                </label>

                <label
                  className={`cursor-pointer p-4 border transition-colors flex flex-col gap-1 ${
                    paymentMethod === "Bank Transfer"
                      ? "border-[#0E0D0C] bg-[#EDE6DA]/60"
                      : "border-[#0E0D0C]/15 bg-[#FAF8F4] hover:border-[#C5A059]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Bank Transfer"
                      checked={paymentMethod === "Bank Transfer"}
                      onChange={() => setPaymentMethod("Bank Transfer")}
                      className="accent-[#0E0D0C]"
                    />
                    <span className="text-sm font-semibold text-[#0E0D0C]">
                      Bank Transfer (IBFT)
                    </span>
                  </div>
                  <p className="text-xs text-[#6E655B] pl-6">
                    Transfer details are shared via email upon order confirmation.
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white border border-[#0E0D0C]/10 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-medium text-[#0E0D0C] pb-4 border-b border-[#0E0D0C]/10">
                Order Summary
              </h2>

              <ul className="divide-y divide-[#0E0D0C]/10 my-4">
                {orderLines.map((line) => (
                  <li
                    key={`${line.product_id}-${line.size}`}
                    className="py-4 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-[#EDE6DA] shrink-0 overflow-hidden border border-[#0E0D0C]/10">
                      <LuxuryImage
                        src={line.image_url}
                        alt={line.product_name}
                        fallbackTitle={line.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-lg font-semibold text-[#0E0D0C] truncate">
                        {line.product_name}
                      </p>
                      <p className="text-xs text-[#6E655B] tabular-nums">
                        {line.size} · Qty {line.quantity} ×{" "}
                        {formatPKR(line.unit_price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-[#0E0D0C] shrink-0">
                      {formatPKR(line.unit_price * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-[#0E0D0C]/10 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#6E655B]">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#0E0D0C]">
                    {formatPKR(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#6E655B]">
                  <span>Delivery</span>
                  <span className="tabular-nums font-medium text-[#0E0D0C]">
                    {deliveryFee === 0 ? "Complimentary" : formatPKR(deliveryFee)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#0E0D0C]/10 flex justify-between items-baseline">
                  <span className="font-semibold text-[#0E0D0C]">
                    Total Amount
                  </span>
                  <span className="text-xl font-semibold tabular-nums text-[#0E0D0C]">
                    {formatPKR(totalAmount)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <p className="mt-4 text-xs text-[#8B3A3A] bg-red-50 border border-red-200 p-3">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || orderLines.length === 0}
                className="mt-6 w-full py-4 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.14em] uppercase hover:bg-[#26231F] transition-colors disabled:opacity-50"
              >
                {submitting
                  ? "Confirming Order..."
                  : `Place Order · ${formatPKR(totalAmount)}`}
              </button>
              <p className="mt-3 text-[11px] text-center text-[#6E655B]">
                Cash on Delivery available nationwide · Sealed luxury packaging
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
