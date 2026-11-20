import { useEffect, useState } from "react";
import { Edit2, Minus, Plus, Trash2, X } from "lucide-react";
import {
  AdminStats,
  CustomerEnquiry,
  EnquiryStatus,
  FragranceCategory,
  Order,
  OrderStatus,
  Product,
} from "../types";
import { formatPKR, STUDIO_PERFUME_IMAGES } from "../lib/format";
import { LuxuryImage } from "./LuxuryImage";

interface AdminDashboardViewProps {
  products: Product[];
  onRefreshProducts: () => Promise<void>;
}

interface ProductFormState {
  name: string;
  category: FragranceCategory;
  is_luxury: boolean;
  is_bestseller: boolean;
  description: string;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  price_pkr: string;
  sizes: string;
  stock: string;
  image_url: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  category: "Unisex",
  is_luxury: true,
  is_bestseller: false,
  description: "",
  top_notes: "",
  middle_notes: "",
  base_notes: "",
  price_pkr: "14500",
  sizes: "30ml, 50ml, 100ml",
  stock: "20",
  image_url: STUDIO_PERFUME_IMAGES[0].url,
};

export function AdminDashboardView({
  products,
  onRefreshProducts,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<
    "products" | "orders" | "enquiries"
  >("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, enqRes, statsRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/enquiries"),
        fetch("/api/admin/stats"),
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (enqRes.ok) setEnquiries(await enqRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormState(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormState({
      name: product.name,
      category: product.category,
      is_luxury: product.is_luxury === 1,
      is_bestseller: product.is_bestseller === 1,
      description: product.description,
      top_notes: product.top_notes,
      middle_notes: product.middle_notes,
      base_notes: product.base_notes,
      price_pkr: String(product.price_pkr),
      sizes: product.sizes,
      stock: String(product.stock),
      image_url: product.image_url,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      name: formState.name,
      category: formState.category,
      is_luxury: formState.is_luxury,
      is_bestseller: formState.is_bestseller,
      description: formState.description,
      top_notes: formState.top_notes,
      middle_notes: formState.middle_notes,
      base_notes: formState.base_notes,
      price_pkr: Number(formState.price_pkr),
      sizes: formState.sizes,
      stock: Number(formState.stock),
      image_url: formState.image_url,
    };

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to save fragrance");
      }

      setModalOpen(false);
      await onRefreshProducts();
      await loadAdminData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDeleteId(null);
        await onRefreshProducts();
        await loadAdminData();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleQuickStockAdjust = async (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock }),
      });
      if (res.ok) {
        await onRefreshProducts();
        await loadAdminData();
      }
    } catch (err) {
      console.error("Failed to adjust stock", err);
    }
  };

  const handleOrderStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        await loadAdminData();
      }
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const handleEnquiryStatusChange = async (
    enquiryId: number,
    status: EnquiryStatus
  ) => {
    try {
      const res = await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? updated : e))
        );
        await loadAdminData();
      }
    } catch (err) {
      console.error("Failed to update enquiry status", err);
    }
  };

  return (
    <section className="bg-[#FAF8F4] min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="pb-8 border-b border-[#0E0D0C]/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#9E7B36] font-semibold">
              House Management
            </p>
            <h1 className="mt-1.5 font-display text-4xl sm:text-5xl font-medium text-[#0E0D0C]">
              Admin Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.12em] uppercase hover:bg-[#26231F] transition-colors self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>Add New Perfume</span>
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="py-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-[#0E0D0C]/10 p-5">
            <span className="text-[11px] tracking-[0.14em] uppercase text-[#6E655B] font-semibold">
              Total Revenue
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold tabular-nums text-[#0E0D0C]">
              {formatPKR(stats?.totalRevenue ?? 0)}
            </p>
          </div>
          <div className="bg-white border border-[#0E0D0C]/10 p-5">
            <span className="text-[11px] tracking-[0.14em] uppercase text-[#6E655B] font-semibold">
              Customer Orders
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold tabular-nums text-[#0E0D0C]">
              {stats?.totalOrders ?? orders.length}
            </p>
          </div>
          <div className="bg-white border border-[#0E0D0C]/10 p-5">
            <span className="text-[11px] tracking-[0.14em] uppercase text-[#6E655B] font-semibold">
              Active Fragrances
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold tabular-nums text-[#0E0D0C]">
              {products.length}
            </p>
          </div>
          <div className="bg-white border border-[#0E0D0C]/10 p-5">
            <span className="text-[11px] tracking-[0.14em] uppercase text-[#6E655B] font-semibold">
              New Enquiries
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl font-semibold tabular-nums text-[#9E7B36]">
              {stats?.newEnquiriesCount ??
                enquiries.filter((e) => e.status === "New").length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-2 border-b border-[#0E0D0C]/10 overflow-x-auto"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            className={`px-5 py-3 text-xs tracking-[0.12em] uppercase font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "products"
                ? "border-[#0E0D0C] text-[#0E0D0C]"
                : "border-transparent text-[#6E655B] hover:text-[#0E0D0C]"
            }`}
          >
            Perfumes &amp; Stock ({products.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-3 text-xs tracking-[0.12em] uppercase font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "orders"
                ? "border-[#0E0D0C] text-[#0E0D0C]"
                : "border-transparent text-[#6E655B] hover:text-[#0E0D0C]"
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "enquiries"}
            onClick={() => setActiveTab("enquiries")}
            className={`px-5 py-3 text-xs tracking-[0.12em] uppercase font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === "enquiries"
                ? "border-[#0E0D0C] text-[#0E0D0C]"
                : "border-transparent text-[#6E655B] hover:text-[#0E0D0C]"
            }`}
          >
            Customer Enquiries ({enquiries.length})
          </button>
        </div>

        {/* Tab 1: Products Table */}
        {activeTab === "products" && (
          <div className="pt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white border border-[#0E0D0C]/10">
              <thead>
                <tr className="border-b border-[#0E0D0C]/10 bg-[#EDE6DA]/55 text-[11px] tracking-[0.12em] uppercase text-[#6E655B]">
                  <th className="py-3.5 px-4 font-semibold">Fragrance</th>
                  <th className="py-3.5 px-4 font-semibold">Collection</th>
                  <th className="py-3.5 px-4 font-semibold">50ml Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0E0D0C]/10 text-sm">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F4]/70">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-[#EDE6DA] shrink-0 overflow-hidden border border-[#0E0D0C]/10">
                          <LuxuryImage
                            src={p.image_url}
                            alt={p.name}
                            fallbackTitle={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-display text-lg font-semibold text-[#0E0D0C]">
                            {p.name}
                          </div>
                          <div className="text-xs text-[#6E655B]">
                            {p.sizes}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#6E655B]">
                      <span>{p.category}</span>
                      {p.is_luxury === 1 && <span> · Luxury</span>}
                      {p.is_bestseller === 1 && <span> · Best Seller</span>}
                    </td>
                    <td className="py-4 px-4 font-semibold tabular-nums text-[#0E0D0C]">
                      {formatPKR(p.price_pkr)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center border border-[#0E0D0C]/15 bg-[#FAF8F4]">
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjust(p, -1)}
                          aria-label={`Decrease stock for ${p.name}`}
                          className="p-1.5 text-[#0E0D0C] hover:bg-[#EDE6DA]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className={`px-3 text-xs font-semibold tabular-nums ${
                            p.stock <= 5 ? "text-[#8B3A3A]" : "text-[#0E0D0C]"
                          }`}
                        >
                          {p.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickStockAdjust(p, 1)}
                          aria-label={`Increase stock for ${p.name}`}
                          className="p-1.5 text-[#0E0D0C] hover:bg-[#EDE6DA]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {confirmDeleteId === p.id ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="px-2.5 py-1 bg-[#8B3A3A] text-white text-xs font-medium"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 border border-[#0E0D0C]/20 text-xs text-[#6E655B]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#0E0D0C]/15 text-xs font-medium text-[#0E0D0C] hover:border-[#C5A059]"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(p.id)}
                            aria-label={`Delete ${p.name}`}
                            className="p-1.5 border border-[#0E0D0C]/15 text-[#6E655B] hover:text-[#8B3A3A] hover:border-[#8B3A3A]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === "orders" && (
          <div className="pt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-[#6E655B]">Loading customer orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-[#6E655B] py-10">
                No customer orders recorded yet.
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-[#0E0D0C]/10 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E655B]">
                      <span className="font-mono font-semibold text-[#0E0D0C]">
                        {order.order_number}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{order.payment_method}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-semibold text-[#0E0D0C]">
                      {order.customer_name}
                    </h3>
                    <p className="text-xs text-[#6E655B]">
                      {order.email} · {order.phone}
                    </p>
                    <p className="text-xs text-[#0E0D0C]/80">
                      Delivery: {order.delivery_address}
                    </p>

                    <div className="pt-2 text-xs text-[#0E0D0C]">
                      {order.items.map((item) => (
                        <span key={item.id} className="mr-4 inline-block">
                          {item.product_name} ({item.size}) × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
                    <span className="text-lg font-semibold tabular-nums text-[#0E0D0C]">
                      {formatPKR(order.total_amount)}
                    </span>

                    <select
                      value={order.status}
                      aria-label={`Order status for ${order.order_number}`}
                      onChange={(e) =>
                        handleOrderStatusChange(
                          order.id,
                          e.target.value as OrderStatus
                        )
                      }
                      className="px-3 py-2 bg-[#FAF8F4] border border-[#0E0D0C]/20 text-xs font-medium text-[#0E0D0C] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Customer Enquiries */}
        {activeTab === "enquiries" && (
          <div className="pt-6 space-y-4">
            {loading ? (
              <p className="text-sm text-[#6E655B]">Loading enquiries...</p>
            ) : enquiries.length === 0 ? (
              <p className="text-sm text-[#6E655B] py-10">
                No customer enquiries submitted yet.
              </p>
            ) : (
              enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-white border border-[#0E0D0C]/10 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-3 text-xs text-[#6E655B]">
                      <span className="font-semibold text-[#0E0D0C]">
                        {enq.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{enq.email}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{enq.phone}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#0E0D0C]/85 pt-1">
                      {enq.message}
                    </p>
                    <p className="text-[11px] text-[#6E655B] tabular-nums">
                      Received {new Date(enq.created_at).toLocaleString()}
                    </p>
                  </div>

                  <select
                    value={enq.status}
                    aria-label={`Status for enquiry from ${enq.name}`}
                    onChange={(e) =>
                      handleEnquiryStatusChange(
                        enq.id,
                        e.target.value as EnquiryStatus
                      )
                    }
                    className="px-3 py-2 bg-[#FAF8F4] border border-[#0E0D0C]/20 text-xs font-medium text-[#0E0D0C] focus:outline-none focus:border-[#C5A059] shrink-0"
                  >
                    <option value="New">New</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingProduct ? "Edit Fragrance" : "Add New Fragrance"}
        >
          <div
            className="fixed inset-0 bg-[#0E0D0C]/60 backdrop-blur-[2px]"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF8F4] border border-[#0E0D0C]/20 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#0E0D0C]/10">
              <h2 className="font-display text-2xl font-medium text-[#0E0D0C]">
                {editingProduct
                  ? `Edit ${editingProduct.name}`
                  : "Add New Perfume"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-[#6E655B] hover:text-[#0E0D0C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Perfume Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="e.g. Velvet Acacia"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Category
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        category: e.target.value as FragranceCategory,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    50ml Price (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={formState.price_pkr}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, price_pkr: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formState.stock}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, stock: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Bottle Sizes
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.sizes}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, sizes: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="inline-flex items-center gap-2 text-sm text-[#0E0D0C]">
                  <input
                    type="checkbox"
                    checked={formState.is_luxury}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        is_luxury: e.target.checked,
                      }))
                    }
                    className="accent-[#0E0D0C]"
                  />
                  <span>Luxury Collection</span>
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-[#0E0D0C]">
                  <input
                    type="checkbox"
                    checked={formState.is_bestseller}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        is_bestseller: e.target.checked,
                      }))
                    }
                    className="accent-[#0E0D0C]"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                  Fragrance Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the olfactory character, mood, and concentration..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Top Notes
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.top_notes}
                    onChange={(e) =>
                      setFormState((s) => ({ ...s, top_notes: e.target.value }))
                    }
                    placeholder="Saffron, Bergamot"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Middle Notes
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.middle_notes}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        middle_notes: e.target.value,
                      }))
                    }
                    placeholder="Damask Rose, Oud"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                    Base Notes
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.base_notes}
                    onChange={(e) =>
                      setFormState((s) => ({
                        ...s,
                        base_notes: e.target.value,
                      }))
                    }
                    placeholder="Sandalwood, Musk"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.1em] uppercase font-semibold text-[#6E655B] mb-1.5">
                  Studio Flacon Photography
                </label>
                <select
                  value={formState.image_url}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, image_url: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-[#0E0D0C]/15 text-sm"
                >
                  {STUDIO_PERFUME_IMAGES.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="text-xs text-[#8B3A3A] bg-red-50 border border-red-200 p-3">
                  {formError}
                </p>
              )}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#0E0D0C]/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-[#0E0D0C]/20 text-xs font-semibold tracking-[0.1em] uppercase text-[#0E0D0C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0E0D0C] text-[#FAF8F4] text-xs font-semibold tracking-[0.12em] uppercase hover:bg-[#26231F] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Create Perfume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
