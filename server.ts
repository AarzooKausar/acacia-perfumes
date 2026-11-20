import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import db, { initDatabase } from "./server/db.ts";

initDatabase();

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve generated assets reliably in both dev and production
app.use(
  "/src/assets/images",
  express.static(path.resolve(process.cwd(), "src/assets/images"))
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Products catalogue
app.get("/api/products", (req, res) => {
  try {
    const { category, collection, search } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params: (string | number)[] = [];

    if (category && typeof category === "string" && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    if (collection === "Luxury") {
      query += " AND is_luxury = 1";
    } else if (collection === "Best Sellers") {
      query += " AND is_bestseller = 1";
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      query +=
        " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(top_notes) LIKE ? OR LOWER(middle_notes) LIKE ? OR LOWER(base_notes) LIKE ?)";
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term, term, term);
    }

    query += " ORDER BY is_bestseller DESC, id ASC";
    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to load fragrances" });
  }
});

app.get("/api/products/:id", (req, res) => {
  try {
    const product = db
      .prepare("SELECT * FROM products WHERE id = ? OR slug = ?")
      .get(req.params.id, req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Fragrance not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Failed to load fragrance" });
  }
});

app.post("/api/products", (req, res) => {
  try {
    const {
      name,
      category,
      is_luxury,
      is_bestseller,
      description,
      top_notes,
      middle_notes,
      base_notes,
      price_pkr,
      sizes,
      stock,
      image_url,
    } = req.body;

    if (!name || !category || !description || !price_pkr) {
      return res.status(400).json({ error: "Name, category, description, and price are required." });
    }

    const baseSlug = String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, category, is_luxury, is_bestseller, description,
        top_notes, middle_notes, base_notes, price_pkr, sizes, stock, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      String(name).trim(),
      slug,
      category,
      is_luxury ? 1 : 0,
      is_bestseller ? 1 : 0,
      String(description).trim(),
      String(top_notes || "Bergamot, Saffron").trim(),
      String(middle_notes || "Damask Rose, Cedar").trim(),
      String(base_notes || "Ambergris, Sandalwood").trim(),
      Number(price_pkr),
      String(sizes || "30ml, 50ml, 100ml").trim(),
      Number(stock ?? 10),
      String(image_url || "/src/assets/images/perfume_oud_qamar_1794716207813.jpg").trim()
    );

    const created = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Failed to create fragrance" });
  }
});

app.put("/api/products/:id", (req, res) => {
  try {
    const existing = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Fragrance not found" });
    }

    const {
      name,
      category,
      is_luxury,
      is_bestseller,
      description,
      top_notes,
      middle_notes,
      base_notes,
      price_pkr,
      sizes,
      stock,
      image_url,
    } = req.body;

    db.prepare(`
      UPDATE products SET
        name = ?,
        category = ?,
        is_luxury = ?,
        is_bestseller = ?,
        description = ?,
        top_notes = ?,
        middle_notes = ?,
        base_notes = ?,
        price_pkr = ?,
        sizes = ?,
        stock = ?,
        image_url = ?
      WHERE id = ?
    `).run(
      name ?? (existing as any).name,
      category ?? (existing as any).category,
      is_luxury !== undefined ? (is_luxury ? 1 : 0) : (existing as any).is_luxury,
      is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : (existing as any).is_bestseller,
      description ?? (existing as any).description,
      top_notes ?? (existing as any).top_notes,
      middle_notes ?? (existing as any).middle_notes,
      base_notes ?? (existing as any).base_notes,
      price_pkr !== undefined ? Number(price_pkr) : (existing as any).price_pkr,
      sizes ?? (existing as any).sizes,
      stock !== undefined ? Math.max(0, Number(stock)) : (existing as any).stock,
      image_url ?? (existing as any).image_url,
      req.params.id
    );

    const updated = db
      .prepare("SELECT * FROM products WHERE id = ?")
      .get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update fragrance" });
  }
});

app.delete("/api/products/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM products WHERE id = ?")
      .run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Fragrance not found" });
    }
    res.json({ deleted: true, id: Number(req.params.id) });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete fragrance" });
  }
});

// Orders
app.get("/api/orders", (_req, res) => {
  try {
    const orders = db
      .prepare("SELECT * FROM orders ORDER BY id DESC")
      .all() as any[];
    const getItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
    const enriched = orders.map((order) => ({
      ...order,
      items: getItems.all(order.id),
    }));
    res.json(enriched);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to load orders" });
  }
});

app.post("/api/orders", (req, res) => {
  try {
    const {
      customer_name,
      email,
      phone,
      delivery_address,
      payment_method,
      items,
      total_amount,
    } = req.body;

    if (
      !customer_name ||
      !email ||
      !phone ||
      !delivery_address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Customer details, delivery address, and at least one fragrance are required.",
      });
    }

    const createOrderTx = db.transaction(() => {
      const custRes = db
        .prepare(
          "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)"
        )
        .run(
          String(customer_name).trim(),
          String(email).trim(),
          String(phone).trim(),
          String(delivery_address).trim()
        );

      const orderNumber = `ACA-${1043 + Math.floor(Math.random() * 8900)}`;

      let computedTotal = 0;
      const validatedItems: Array<{
        product_id: number | null;
        product_name: string;
        size: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
      }> = [];

      for (const item of items) {
        const qty = Math.max(1, Number(item.quantity || 1));
        const unitPrice = Math.max(0, Number(item.unit_price || 0));
        const subtotal = qty * unitPrice;
        computedTotal += subtotal;

        if (item.product_id) {
          const prod = db
            .prepare("SELECT id, stock FROM products WHERE id = ?")
            .get(item.product_id) as { id: number; stock: number } | undefined;
          if (prod) {
            const newStock = Math.max(0, prod.stock - qty);
            db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(
              newStock,
              prod.id
            );
          }
        }

        validatedItems.push({
          product_id: item.product_id ? Number(item.product_id) : null,
          product_name: String(item.product_name),
          size: String(item.size || "50ml"),
          quantity: qty,
          unit_price: unitPrice,
          subtotal,
        });
      }

      const finalTotal =
        typeof total_amount === "number" && total_amount >= computedTotal
          ? total_amount
          : computedTotal;

      const orderRes = db
        .prepare(`
          INSERT INTO orders (
            order_number, customer_id, customer_name, email, phone,
            delivery_address, total_amount, payment_method, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          orderNumber,
          custRes.lastInsertRowid,
          String(customer_name).trim(),
          String(email).trim(),
          String(phone).trim(),
          String(delivery_address).trim(),
          finalTotal,
          String(payment_method || "Cash on Delivery"),
          "Pending"
        );

      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_name, size, quantity, unit_price, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const vi of validatedItems) {
        insertItemStmt.run(
          orderRes.lastInsertRowid,
          vi.product_id,
          vi.product_name,
          vi.size,
          vi.quantity,
          vi.unit_price,
          vi.subtotal
        );
      }

      const createdOrder = db
        .prepare("SELECT * FROM orders WHERE id = ?")
        .get(orderRes.lastInsertRowid) as any;
      const orderItems = db
        .prepare("SELECT * FROM order_items WHERE order_id = ?")
        .all(orderRes.lastInsertRowid);

      return { ...createdOrder, items: orderItems };
    });

    const created = createOrderTx();
    res.status(201).json(created);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }
    const result = db
      .prepare("UPDATE orders SET status = ? WHERE id = ?")
      .run(status, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const updated = db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(req.params.id) as any;
    const items = db
      .prepare("SELECT * FROM order_items WHERE order_id = ?")
      .all(req.params.id);
    res.json({ ...updated, items });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Customer Enquiries
app.get("/api/enquiries", (_req, res) => {
  try {
    const enquiries = db
      .prepare("SELECT * FROM customer_enquiries ORDER BY id DESC")
      .all();
    res.json(enquiries);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ error: "Failed to load enquiries" });
  }
});

app.post("/api/enquiries", (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res
        .status(400)
        .json({ error: "Please complete all fields before submitting." });
    }
    const resInsert = db
      .prepare(
        "INSERT INTO customer_enquiries (name, email, phone, message, status) VALUES (?, ?, ?, ?, 'New')"
      )
      .run(
        String(name).trim(),
        String(email).trim(),
        String(phone).trim(),
        String(message).trim()
      );

    const created = db
      .prepare("SELECT * FROM customer_enquiries WHERE id = ?")
      .get(resInsert.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error submitting enquiry:", err);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

app.patch("/api/enquiries/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    if (!["New", "Reviewed", "Resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid enquiry status" });
    }
    const result = db
      .prepare("UPDATE customer_enquiries SET status = ? WHERE id = ?")
      .run(status, req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const updated = db
      .prepare("SELECT * FROM customer_enquiries WHERE id = ?")
      .get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error("Error updating enquiry:", err);
    res.status(500).json({ error: "Failed to update enquiry" });
  }
});

// Newsletter
app.post("/api/newsletter", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    db.prepare(
      "INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)"
    ).run(String(email).trim().toLowerCase());
    res.status(201).json({ subscribed: true, email: String(email).trim().toLowerCase() });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// Admin summary stats
app.get("/api/admin/stats", (_req, res) => {
  try {
    const revRow = db
      .prepare(
        "SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as count FROM orders WHERE status != 'Cancelled'"
      )
      .get() as { revenue: number; count: number };
    const prodRow = db
      .prepare("SELECT COUNT(*) as total, SUM(CASE WHEN stock <= 10 THEN 1 ELSE 0 END) as lowStock FROM products")
      .get() as { total: number; lowStock: number };
    const enqRow = db
      .prepare("SELECT COUNT(*) as newCount FROM customer_enquiries WHERE status = 'New'")
      .get() as { newCount: number };

    res.json({
      totalRevenue: revRow.revenue,
      totalOrders: revRow.count,
      totalProducts: prodRow.total,
      lowStockCount: prodRow.lowStock || 0,
      newEnquiriesCount: enqRow.newCount || 0,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ACACIA storefront server listening on http://localhost:${PORT}`);
  });
}

startServer();
