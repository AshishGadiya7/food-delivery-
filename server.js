const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "hungryhub-dev-secret";
const DB_PATH = path.join(__dirname, "hungryhub.db");

const U = "https://images.unsplash.com/";
const Q = "?q=80&w=900&auto=format&fit=crop";
const FOODS = [
  { id: "f1", name: "Margherita Pizza", price: 995, calories: 780, category: "Pizza", healthType: "junk", tags: ["high-protein"], weatherFit: ["moderate", "rainy", "cold"], moodFit: ["happy", "lazy"], i: U + "photo-1513104890138-7c749659a591" + Q },
  { id: "f2", name: "Chicken Burger", price: 705, calories: 640, category: "Burger", healthType: "junk", tags: ["high-protein"], weatherFit: ["hot", "moderate"], moodFit: ["stressed", "lazy", "happy"], i: U + "photo-1568901346375-23c9450c58cd" + Q },
  { id: "f3", name: "Quinoa Power Bowl", price: 851, calories: 420, category: "Healthy", healthType: "healthy", tags: ["low-calorie", "high-protein"], weatherFit: ["hot", "moderate", "cold", "rainy"], moodFit: ["energetic", "happy"], i: U + "photo-1512621776951-a57141f2eefd" + Q },
  { id: "f4", name: "Ice Cream Sundae", price: 432, calories: 360, category: "Desserts", healthType: "junk", tags: [], weatherFit: ["hot"], moodFit: ["happy", "stressed"], i: U + "photo-1563805042-7684c019e1cb" + Q },
  { id: "f5", name: "Tomato Basil Soup", price: 506, calories: 210, category: "Soups", healthType: "healthy", tags: ["low-calorie"], weatherFit: ["cold", "rainy"], moodFit: ["stressed", "lazy"], i: U + "photo-1547592180-85f173990554" + Q },
  { id: "f6", name: "Iced Mango Juice", price: 394, calories: 160, category: "Drinks", healthType: "healthy", tags: ["low-calorie"], weatherFit: ["hot"], moodFit: ["happy", "energetic", "lazy"], i: U + "photo-1600271886742-f049cd5bba3f" + Q },
  { id: "f7", name: "French Fries", price: 331, calories: 420, category: "Snacks", healthType: "junk", tags: [], weatherFit: ["moderate", "rainy", "hot"], moodFit: ["lazy", "happy", "stressed"], i: U + "photo-1576107232684-1279f390859f" + Q },
  { id: "f8", name: "Cappuccino", price: 270, calories: 140, category: "Drinks", healthType: "healthy", tags: ["low-calorie"], weatherFit: ["cold", "rainy", "moderate"], moodFit: ["lazy", "stressed", "energetic"], i: U + "photo-1509042239860-f550ce710b93" + Q },
  { id: "f9", name: "Protein Wrap", price: 647, calories: 390, category: "Healthy", healthType: "healthy", tags: ["high-protein", "low-calorie"], weatherFit: ["hot", "moderate"], moodFit: ["energetic", "lazy"], i: U + "photo-1585238342024-78d387f4a707" + Q },
  { id: "f10", name: "Chocolate Brownie", price: 361, calories: 310, category: "Desserts", healthType: "junk", tags: [], weatherFit: ["rainy", "cold", "moderate"], moodFit: ["stressed", "happy"], i: U + "photo-1606313564200-e75d5e30476d" + Q },
  { id: "f11", name: "Grilled Salmon Plate", price: 1204, calories: 520, category: "Healthy", healthType: "healthy", tags: ["high-protein", "low-calorie"], weatherFit: ["moderate", "hot"], moodFit: ["energetic", "happy"], i: U + "photo-1467003909585-2f8a72700288" + Q },
  { id: "f12", name: "Crispy Fried Chicken", price: 829, calories: 890, category: "Comfort", healthType: "junk", tags: ["high-protein"], weatherFit: ["rainy", "cold", "moderate"], moodFit: ["stressed", "lazy"], i: U + "photo-1626082927389-6cd097cdc6ec" + Q },
  { id: "f13", name: "Green Smoothie", price: 457, calories: 180, category: "Drinks", healthType: "healthy", tags: ["low-calorie", "high-protein"], weatherFit: ["hot", "moderate"], moodFit: ["energetic", "happy"], i: U + "photo-1610970881699-44a5587cabec" + Q },
  { id: "f14", name: "Spicy Ramen Bowl", price: 768, calories: 680, category: "Bowls", healthType: "junk", tags: ["high-protein"], weatherFit: ["cold", "rainy"], moodFit: ["stressed", "lazy", "happy"], i: U + "photo-1569718212165-3a8278d5f624" + Q }
];

function tokenFor(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function parseAuth(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

async function authRequired(req, res, next) {
  const payload = parseAuth(req);
  if (!payload) return res.status(401).json({ error: "Unauthorized" });
  const user = await req.db.get("SELECT id, name, email FROM users WHERE id = ?", payload.id);
  if (!user) return res.status(401).json({ error: "Invalid token" });
  req.user = user;
  next();
}

async function bootstrap(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      calories INTEGER NOT NULL,
      category TEXT NOT NULL,
      healthType TEXT NOT NULL,
      tags TEXT NOT NULL,
      weatherFit TEXT NOT NULL,
      moodFit TEXT NOT NULL,
      image TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cart_items (
      user_id INTEGER NOT NULL,
      food_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      PRIMARY KEY (user_id, food_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  const count = await db.get("SELECT COUNT(*) AS c FROM foods");
  if (!count.c) {
    const stmt = await db.prepare(`
      INSERT INTO foods (id, name, price, calories, category, healthType, tags, weatherFit, moodFit, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of FOODS) {
      await stmt.run(
        f.id,
        f.name,
        f.price,
        f.calories,
        f.category,
        f.healthType,
        JSON.stringify(f.tags),
        JSON.stringify(f.weatherFit),
        JSON.stringify(f.moodFit),
        f.i
      );
    }
    await stmt.finalize();
  }

  const demoEmail = "demo@hungryhub.app";
  const demo = await db.get("SELECT id FROM users WHERE email = ?", demoEmail);
  if (!demo) {
    const hash = await bcrypt.hash("demo123", 10);
    await db.run("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", "Demo User", demoEmail, hash);
  }
}

async function main() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await bootstrap(db);

  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.db = db;
    next();
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body || {};
      if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
      if (password.length < 4) return res.status(400).json({ error: "Password must be at least 4 chars" });
      const exists = await db.get("SELECT id FROM users WHERE email = ?", email.toLowerCase());
      if (exists) return res.status(409).json({ error: "Email already exists" });
      const hash = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
        name.trim(),
        email.toLowerCase(),
        hash
      );
      const user = { id: result.lastID, name: name.trim(), email: email.toLowerCase() };
      res.json({ token: tokenFor(user), user });
    } catch {
      res.status(500).json({ error: "Register failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
      const user = await db.get("SELECT * FROM users WHERE email = ?", email.toLowerCase());
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid credentials" });
      const safeUser = { id: user.id, name: user.name, email: user.email };
      res.json({ token: tokenFor(safeUser), user: safeUser });
    } catch {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authRequired, async (req, res) => {
    res.json({ user: req.user });
  });

  app.get("/api/foods", async (_req, res) => {
    const rows = await db.all("SELECT * FROM foods ORDER BY name");
    const foods = rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      calories: r.calories,
      category: r.category,
      healthType: r.healthType,
      tags: JSON.parse(r.tags),
      weatherFit: JSON.parse(r.weatherFit),
      moodFit: JSON.parse(r.moodFit),
      i: r.image
    }));
    res.json({ foods });
  });

  app.get("/api/cart", authRequired, async (req, res) => {
    const rows = await db.all("SELECT food_id AS id, qty FROM cart_items WHERE user_id = ?", req.user.id);
    res.json({ items: rows });
  });

  app.put("/api/cart", authRequired, async (req, res) => {
    const { items } = req.body || {};
    if (!Array.isArray(items)) return res.status(400).json({ error: "items must be array" });
    await db.run("DELETE FROM cart_items WHERE user_id = ?", req.user.id);
    const stmt = await db.prepare("INSERT INTO cart_items (user_id, food_id, qty) VALUES (?, ?, ?)");
    for (const item of items) {
      const qty = Number(item.qty || 0);
      if (!item.id || qty <= 0) continue;
      await stmt.run(req.user.id, item.id, qty);
    }
    await stmt.finalize();
    res.json({ ok: true });
  });

  app.use(express.static(__dirname));
  app.listen(PORT, () => {
    console.log(`HungryHub running at http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
