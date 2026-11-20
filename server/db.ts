import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve(process.cwd(), "acacia.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL CHECK(category IN ('Men', 'Women', 'Unisex')),
      is_luxury INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      top_notes TEXT NOT NULL,
      middle_notes TEXT NOT NULL,
      base_notes TEXT NOT NULL,
      price_pkr INTEGER NOT NULL,
      sizes TEXT NOT NULL DEFAULT '30ml, 50ml, 100ml',
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery',
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price INTEGER NOT NULL,
      subtotal INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS customer_enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };

  if (productCount.count === 0) {
    seedInitialData();
  }
}

function seedInitialData() {
  const insertProduct = db.prepare(`
    INSERT INTO products (
      name, slug, category, is_luxury, is_bestseller, description,
      top_notes, middle_notes, base_notes, price_pkr, sizes, stock, image_url
    ) VALUES (
      @name, @slug, @category, @is_luxury, @is_bestseller, @description,
      @top_notes, @middle_notes, @base_notes, @price_pkr, @sizes, @stock, @image_url
    )
  `);

  const initialProducts = [
    {
      name: "Oud Al-Qamar",
      slug: "oud-al-qamar",
      category: "Men",
      is_luxury: 1,
      is_bestseller: 1,
      description:
        "A commanding nocturnal extrait where precious aged Cambodian oud meets velvet saffron and luminous ambergris. Blended in small batches for enduring sillage from dusk until dawn.",
      top_notes: "Kashmiri Saffron, Calabrian Bergamot, Cardamom",
      middle_notes: "Aged Cambodian Oud, Turkish Damask Rose, Incense",
      base_notes: "Ambergris, Mysore Sandalwood, Dark Musk",
      price_pkr: 16500,
      sizes: "30ml, 50ml, 100ml",
      stock: 24,
      image_url: "/src/assets/images/perfume_oud_qamar_1794716207813.jpg",
    },
    {
      name: "Fleur de Nuit",
      slug: "fleur-de-nuit",
      category: "Women",
      is_luxury: 1,
      is_bestseller: 1,
      description:
        "An intoxicating white floral portrait inspired by moonlit courtyard gardens. Opulent night-blooming jasmine and tuberose settle over warm Madagascar vanilla and cashmere wood.",
      top_notes: "Blackcurrant Bud, White Pear, Pink Pepper",
      middle_notes: "Night-Blooming Jasmine, Indian Tuberose, Neroli",
      base_notes: "Madagascar Vanilla, Patchouli Heart, Cashmere Wood",
      price_pkr: 14800,
      sizes: "30ml, 50ml, 100ml",
      stock: 19,
      image_url: "/src/assets/images/perfume_fleur_nuit_1794716209869.jpg",
    },
    {
      name: "Santal Velours",
      slug: "santal-velours",
      category: "Unisex",
      is_luxury: 0,
      is_bestseller: 1,
      description:
        "Creamy Australian sandalwood draped in smoked papyrus and crushed cardamom. Intimate, architectural, and effortlessly poised on any skin.",
      top_notes: "Green Cardamom, Violet Leaf, Bergamot Peel",
      middle_notes: "Florentine Iris, Papyrus, Atlas Cedar",
      base_notes: "Australian Sandalwood, Soft Suede, Dry Amber",
      price_pkr: 13200,
      sizes: "30ml, 50ml, 100ml",
      stock: 32,
      image_url: "/src/assets/images/perfume_santal_velours_1794716208705.jpg",
    },
    {
      name: "Noir Botanica",
      slug: "noir-botanica",
      category: "Men",
      is_luxury: 1,
      is_bestseller: 1,
      description:
        "Crisp black pepper and crushed juniper berries ignite over Haitian vetiver and smoked frankincense. Tailored for decisive presence and quiet authority.",
      top_notes: "Black Pepper, Crushed Juniper, Bitter Grapefruit",
      middle_notes: "Haitian Vetiver, Smoked Olibanum, Clary Sage",
      base_notes: "Virginia Cedarwood, Oakmoss, Black Amber",
      price_pkr: 14200,
      sizes: "30ml, 50ml, 100ml",
      stock: 15,
      image_url: "/src/assets/images/perfume_noir_botanica_1794716209921.jpg",
    },
    {
      name: "Rose Impériale",
      slug: "rose-imperiale",
      category: "Women",
      is_luxury: 1,
      is_bestseller: 0,
      description:
        "Dew-kissed Damask rose petals suspended in sparkling white tea and lychee mist, grounded in skin-warming white musk and honeyed amber.",
      top_notes: "Lychee Mist, Sicilian Mandarin, White Tea",
      middle_notes: "Damask Rose, Peony Blossom, Magnolia",
      base_notes: "White Musk, Blonde Cedar, Golden Honey Amber",
      price_pkr: 15400,
      sizes: "30ml, 50ml, 100ml",
      stock: 21,
      image_url: "/src/assets/images/perfume_rose_imperiale_1794716211180.jpg",
    },
    {
      name: "Ambre Doré",
      slug: "ambre-dore",
      category: "Unisex",
      is_luxury: 1,
      is_bestseller: 1,
      description:
        "Molten resinous warmth bottled at extrait concentration. Ceylon cinnamon and blood orange melt into Spanish labdanum, myrrh, and roasted tonka bean.",
      top_notes: "Ceylon Cinnamon, Blood Orange, Nutmeg",
      middle_notes: "Spanish Labdanum, Siam Benzoin, Myrrh Resin",
      base_notes: "Golden Amber, Roasted Tonka Bean, Bourbon Vanilla",
      price_pkr: 17200,
      sizes: "30ml, 50ml, 100ml",
      stock: 11,
      image_url: "/src/assets/images/perfume_ambre_dore_1794716210993.jpg",
    },
    {
      name: "Cèdre Blanc",
      slug: "cedre-blanc",
      category: "Men",
      is_luxury: 0,
      is_bestseller: 0,
      description:
        "Luminous mineral freshness framed by sun-bleached white cedar, sea salt, and wild cypress. Crisp, airy, and unmistakably refined for daytime wear.",
      top_notes: "White Grapefruit, Sea Salt Accord, Wild Mint",
      middle_notes: "White Cedar, Mediterranean Cypress, Lavender",
      base_notes: "Silver Driftwood, Crisp Vetiver, Clean Musk",
      price_pkr: 11800,
      sizes: "30ml, 50ml, 100ml",
      stock: 28,
      image_url: "/src/assets/images/perfume_cedre_blanc_1794716211366.jpg",
    },
    {
      name: "Iris Céleste",
      slug: "iris-celeste",
      category: "Women",
      is_luxury: 0,
      is_bestseller: 0,
      description:
        "Powdery Florentine orris butter softened by sunlit neroli and white peach skin. A serene, second-skin signature that lingers like fine silk.",
      top_notes: "Crisp Aldehydes, Tunisian Neroli, White Peach",
      middle_notes: "Florentine Iris Butter, Mimosa, Heliotrope",
      base_notes: "Ambrette Seed, Powdery White Musk, Tonka",
      price_pkr: 13600,
      sizes: "30ml, 50ml, 100ml",
      stock: 17,
      image_url: "/src/assets/images/perfume_iris_celeste_1794716211547.jpg",
    },
    {
      name: "Musc Sauvage",
      slug: "musc-sauvage",
      category: "Unisex",
      is_luxury: 1,
      is_bestseller: 1,
      description:
        "Velvet suede and smoky guaiac wood wrapped around glowing skin musk and spiced clove bud. Magnetic, tactile, and deeply memorable.",
      top_notes: "Clove Bud, Calabrian Bergamot, Elemi Resin",
      middle_notes: "Brushed Suede, Bourbon Geranium, Frankincense",
      base_notes: "Signature Skin Musk, Guaiac Wood, Labdanum",
      price_pkr: 15900,
      sizes: "30ml, 50ml, 100ml",
      stock: 14,
      image_url: "/src/assets/images/perfume_musc_sauvage_1794716212143.jpg",
    },
  ];

  const seedTx = db.transaction(() => {
    for (const p of initialProducts) {
      insertProduct.run(p);
    }

    const insertCustomer = db.prepare(`
      INSERT INTO customers (name, email, phone, address)
      VALUES (?, ?, ?, ?)
    `);

    const c1 = insertCustomer.run(
      "Zainab Tariq",
      "zainab.tariq@example.com",
      "+92 300 8421904",
      "House 14-B, Street 7, Gulberg III, Lahore"
    );
    const c2 = insertCustomer.run(
      "Hamza Siddiqui",
      "hamza.siddiqui@example.com",
      "+92 321 2948102",
      "Plot 28, Khayaban-e-Muhafiz, Phase 6 DHA, Karachi"
    );

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, customer_id, customer_name, email, phone,
        delivery_address, total_amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, size, quantity, unit_price, subtotal
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const o1 = insertOrder.run(
      "ACA-1041",
      c1.lastInsertRowid,
      "Zainab Tariq",
      "zainab.tariq@example.com",
      "+92 300 8421904",
      "House 14-B, Street 7, Gulberg III, Lahore",
      14800,
      "Cash on Delivery",
      "Confirmed"
    );
    insertOrderItem.run(o1.lastInsertRowid, 2, "Fleur de Nuit", "50ml", 1, 14800, 14800);

    const o2 = insertOrder.run(
      "ACA-1042",
      c2.lastInsertRowid,
      "Hamza Siddiqui",
      "hamza.siddiqui@example.com",
      "+92 321 2948102",
      "Plot 28, Khayaban-e-Muhafiz, Phase 6 DHA, Karachi",
      25600,
      "Cash on Delivery",
      "Pending"
    );
    insertOrderItem.run(o2.lastInsertRowid, 1, "Oud Al-Qamar", "100ml", 1, 25600, 25600);

    const insertEnquiry = db.prepare(`
      INSERT INTO customer_enquiries (name, email, phone, message, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertEnquiry.run(
      "Mehreen Khalid",
      "mehreen.khalid@example.com",
      "+92 333 5192034",
      "Inquiring about bespoke gift engraving on two 100ml bottles of Rose Impériale for a wedding reception next month.",
      "New"
    );
    insertEnquiry.run(
      "Saad Mansoor",
      "saad.mansoor@example.com",
      "+92 345 9012847",
      "Would love to know when Oud Al-Qamar discovery vials will be available for sampling in Islamabad.",
      "Reviewed"
    );
  });

  seedTx();
}

export default db;
