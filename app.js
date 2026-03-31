const $ = (id) => document.getElementById(id);
const CAP = 2000;
const BAR = 2500;
const API = "/api";

function rupees(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const U = "https://images.unsplash.com/";
const Q = "?q=80&w=900&auto=format&fit=crop";
const FALLBACK_FOODS = [
  {
    id: "f1",
    name: "Margherita Pizza",
    price: 995,
    calories: 780,
    category: "Pizza",
    healthType: "junk",
    tags: ["high-protein"],
    weatherFit: ["moderate", "rainy", "cold"],
    moodFit: ["happy", "lazy"],
    i: U + "photo-1513104890138-7c749659a591" + Q
  },
  {
    id: "f2",
    name: "Chicken Burger",
    price: 705,
    calories: 640,
    category: "Burger",
    healthType: "junk",
    tags: ["high-protein"],
    weatherFit: ["hot", "moderate"],
    moodFit: ["stressed", "lazy", "happy"],
    i: U + "photo-1568901346375-23c9450c58cd" + Q
  },
  {
    id: "f3",
    name: "Quinoa Power Bowl",
    price: 851,
    calories: 420,
    category: "Healthy",
    healthType: "healthy",
    tags: ["low-calorie", "high-protein"],
    weatherFit: ["hot", "moderate", "cold", "rainy"],
    moodFit: ["energetic", "happy"],
    i: U + "photo-1512621776951-a57141f2eefd" + Q
  },
  {
    id: "f4",
    name: "Ice Cream Sundae",
    price: 432,
    calories: 360,
    category: "Desserts",
    healthType: "junk",
    tags: [],
    weatherFit: ["hot"],
    moodFit: ["happy", "stressed"],
    i: U + "photo-1563805042-7684c019e1cb" + Q
  },
  {
    id: "f5",
    name: "Tomato Basil Soup",
    price: 506,
    calories: 210,
    category: "Soups",
    healthType: "healthy",
    tags: ["low-calorie"],
    weatherFit: ["cold", "rainy"],
    moodFit: ["stressed", "lazy"],
    i: U + "photo-1547592180-85f173990554" + Q
  },
  {
    id: "f6",
    name: "Iced Mango Juice",
    price: 394,
    calories: 160,
    category: "Drinks",
    healthType: "healthy",
    tags: ["low-calorie"],
    weatherFit: ["hot"],
    moodFit: ["happy", "energetic", "lazy"],
    i: U + "photo-1600271886742-f049cd5bba3f" + Q
  },
  {
    id: "f7",
    name: "French Fries",
    price: 331,
    calories: 420,
    category: "Snacks",
    healthType: "junk",
    tags: [],
    weatherFit: ["moderate", "rainy", "hot"],
    moodFit: ["lazy", "happy", "stressed"],
    i: U + "photo-1576107232684-1279f390859f" + Q
  },
  {
    id: "f8",
    name: "Cappuccino",
    price: 270,
    calories: 140,
    category: "Drinks",
    healthType: "healthy",
    tags: ["low-calorie"],
    weatherFit: ["cold", "rainy", "moderate"],
    moodFit: ["lazy", "stressed", "energetic"],
    i: U + "photo-1509042239860-f550ce710b93" + Q
  },
  {
    id: "f9",
    name: "Protein Wrap",
    price: 647,
    calories: 390,
    category: "Healthy",
    healthType: "healthy",
    tags: ["high-protein", "low-calorie"],
    weatherFit: ["hot", "moderate"],
    moodFit: ["energetic", "lazy"],
    i: U + "photo-1585238342024-78d387f4a707" + Q
  },
  {
    id: "f10",
    name: "Chocolate Brownie",
    price: 361,
    calories: 310,
    category: "Desserts",
    healthType: "junk",
    tags: [],
    weatherFit: ["rainy", "cold", "moderate"],
    moodFit: ["stressed", "happy"],
    i: U + "photo-1606313564200-e75d5e30476d" + Q
  },
  {
    id: "f11",
    name: "Grilled Salmon Plate",
    price: 1204,
    calories: 520,
    category: "Healthy",
    healthType: "healthy",
    tags: ["high-protein", "low-calorie"],
    weatherFit: ["moderate", "hot"],
    moodFit: ["energetic", "happy"],
    i: U + "photo-1467003909585-2f8a72700288" + Q
  },
  {
    id: "f12",
    name: "Crispy Fried Chicken",
    price: 829,
    calories: 890,
    category: "Comfort",
    healthType: "junk",
    tags: ["high-protein"],
    weatherFit: ["rainy", "cold", "moderate"],
    moodFit: ["stressed", "lazy"],
    i: U + "photo-1626082927389-6cd097cdc6ec" + Q
  },
  {
    id: "f13",
    name: "Green Smoothie",
    price: 457,
    calories: 180,
    category: "Drinks",
    healthType: "healthy",
    tags: ["low-calorie", "high-protein"],
    weatherFit: ["hot", "moderate"],
    moodFit: ["energetic", "happy"],
    i: U + "photo-1610970881699-44a5587cabec" + Q
  },
  {
    id: "f14",
    name: "Spicy Ramen Bowl",
    price: 768,
    calories: 680,
    category: "Bowls",
    healthType: "junk",
    tags: ["high-protein"],
    weatherFit: ["cold", "rainy"],
    moodFit: ["stressed", "lazy", "happy"],
    i: U + "photo-1569718212165-3a8278d5f624" + Q
  }
];

const S = {
  category: "All",
  filter: "all",
  search: "",
  mood: "",
  weatherType: "moderate",
  conditionLabel: "Pleasant",
  cart: [],
  token: localStorage.getItem("hungryhub-token") || "",
  user: null,
  authMode: "login"
};

const T = { "low-calorie": "Low calorie", "high-protein": "High protein" };
const M = { happy: "Happy", stressed: "Stressed", lazy: "Lazy", energetic: "Energetic" };
const W = {
  hot: "Heatwave: cold drinks & light plates.",
  cold: "Chilly: warm bowls & sips.",
  rainy: "Rainy: comfort food.",
  moderate: "Nice day: mix healthy + treat."
};

let FOODS = [...FALLBACK_FOODS];
const tpl = $("foodCardTemplate").content.firstElementChild;

function authHeaders() {
  return S.token ? { Authorization: `Bearer ${S.token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function setAuthMessage(text, isError = false) {
  const msg = $("authMessage");
  msg.textContent = text;
  msg.style.color = isError ? "#dc2626" : "";
}

function openAuthModal() {
  $("authOverlay").classList.add("visible");
  $("authModal").classList.remove("auth-hidden");
}

function closeAuthModal() {
  $("authOverlay").classList.remove("visible");
  $("authModal").classList.add("auth-hidden");
  setAuthMessage("");
}

function updateAuthButton() {
  $("authBtn").textContent = S.user ? "Logout" : "Login";
}

function toggleAuthMode(mode) {
  S.authMode = mode;
  $("authTitle").textContent = mode === "login" ? "Login" : "Register";
  $("loginTab").classList.toggle("active", mode === "login");
  $("registerTab").classList.toggle("active", mode === "register");
  $("authName").style.display = mode === "register" ? "" : "none";
}

async function initializeAuth() {
  if (!S.token) {
    openAuthModal();
    updateAuthButton();
    return false;
  }
  try {
    const me = await api("/auth/me");
    S.user = me.user;
    closeAuthModal();
    updateAuthButton();
    return true;
  } catch {
    localStorage.removeItem("hungryhub-token");
    S.token = "";
    S.user = null;
    openAuthModal();
    updateAuthButton();
    return false;
  }
}

async function loadDataFromDb() {
  try {
    const [foodsRes, cartRes] = await Promise.all([api("/foods"), api("/cart")]);
    FOODS = foodsRes.foods?.length ? foodsRes.foods : [...FALLBACK_FOODS];
    S.cart = Array.isArray(cartRes.items) ? cartRes.items : [];
  } catch {
    FOODS = [...FALLBACK_FOODS];
    S.cart = [];
  }
}

async function saveCartToDb() {
  if (!S.user) return;
  try {
    await api("/cart", {
      method: "PUT",
      body: JSON.stringify({ items: S.cart })
    });
  } catch {
    // keep UI responsive even if db save fails
  }
}

function totals() {
  let n = 0;
  let p = 0;
  let c = 0;
  S.cart.forEach((e) => {
    const x = FOODS.find((f) => f.id === e.id);
    if (x) {
      n += e.qty;
      p += x.price * e.qty;
      c += x.calories * e.qty;
    }
  });
  return { n, p, c };
}

function pickScore(x) {
  let s = x.weatherFit.includes(S.weatherType) ? 3 : 0;
  if (S.mood && x.moodFit.includes(S.mood)) s += 2;
  if (x.healthType === "healthy") s += 0.5;
  return s;
}

function smartPicks(limit = 6) {
  return [...FOODS].sort((a, b) => pickScore(b) - pickScore(a)).slice(0, limit);
}

function filterList(items) {
  return items.filter((x) => {
    if (S.category !== "All" && x.category !== S.category) return false;
    if (!x.name.toLowerCase().includes(S.search)) return false;
    if (S.filter === "low-calorie" && !x.tags.includes("low-calorie")) return false;
    if (S.filter === "high-protein" && !x.tags.includes("high-protein")) return false;
    if (S.filter === "weather" && !x.weatherFit.includes(S.weatherType)) return false;
    return true;
  });
}

function head() {
  const w = W[S.weatherType] || W.moderate;
  $("headerSuggestion").textContent = S.mood ? `${w} Mood: ${M[S.mood]}.` : w;
  $("smartPicksHint").textContent = `${S.mood ? `Mood: ${M[S.mood]}. ` : "Any mood. "}Weather: ${S.conditionLabel} (${S.weatherType}).`;
}

function card(item, el, options = {}) {
  const { btn = "Add to cart", anim = 1 } = options;
  const node = tpl.cloneNode(true);
  const im = node.querySelector(".food-image");
  const hb = node.querySelector(".health-badge");
  const tw = node.querySelector(".food-tags");
  const ab = node.querySelector(".add-btn");

  im.src = item.i;
  im.alt = item.name;
  node.querySelector(".food-name").textContent = item.name;
  node.querySelector(".food-price").textContent = rupees(item.price);
  node.querySelector(".food-calories").textContent = item.calories + " kcal";
  ab.textContent = btn;
  hb.textContent = item.healthType === "healthy" ? "Healthy" : "Junk";
  hb.classList.toggle("is-junk", item.healthType === "junk");
  tw.innerHTML = "";
  item.tags.forEach((t) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = T[t] || t;
    tw.appendChild(span);
  });
  ab.onclick = () => {
    add(item.id);
    ab.classList.add("added");
    setTimeout(() => ab.classList.remove("added"), 360);
  };
  if (anim) node.classList.add("food-card-enter");
  el.appendChild(node);
}

function grid() {
  const g = $("foodGrid");
  const list = filterList(FOODS);
  g.innerHTML = list.length ? "" : '<p class="empty-hint">No matches.</p>';
  list.forEach((x) => card(x, g, { anim: 0 }));
}

function recs() {
  const g = $("recommendedGrid");
  g.innerHTML = "";
  smartPicks().forEach((x) => card(x, g, { btn: "Add", anim: 1 }));
}

function cats() {
  const categories = ["All", ...new Set(FOODS.map((x) => x.category))];
  const wrap = $("categoryList");
  wrap.innerHTML = "";
  categories.forEach((name) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "category-chip" + (S.category === name ? " active" : "");
    b.textContent = name;
    b.onclick = () => {
      S.category = name;
      document.querySelectorAll(".category-chip").forEach((el) => el.classList.remove("active"));
      b.classList.add("active");
      grid();
    };
    wrap.appendChild(b);
  });
}

function add(id) {
  if (!S.user) return openAuthModal();
  const row = S.cart.find((x) => x.id === id);
  if (row) row.qty += 1;
  else S.cart.push({ id, qty: 1 });
  paint();
  saveCartToDb();
}

function sub(id) {
  const i = S.cart.findIndex((x) => x.id === id);
  if (i < 0) return;
  if (S.cart[i].qty > 1) S.cart[i].qty -= 1;
  else S.cart.splice(i, 1);
  paint();
  saveCartToDb();
}

function paint() {
  const { n, p, c } = totals();
  const ci = $("cartItems");
  ci.innerHTML = "";
  S.cart.forEach((e) => {
    const x = FOODS.find((f) => f.id === e.id);
    if (!x) return;
    const r = document.createElement("article");
    r.className = "cart-item";
    r.innerHTML = `
      <img src="${x.i}" alt="${x.name}">
      <div>
        <strong>${x.name}</strong>
        <p>${rupees(x.price)} × ${e.qty}</p>
      </div>
      <button type="button" class="icon-btn" aria-label="Remove one">−</button>
    `;
    r.querySelector("button").onclick = () => sub(x.id);
    ci.appendChild(r);
  });
  if (!S.cart.length) ci.innerHTML = '<p class="empty-hint">Cart empty.</p>';

  $("summaryItems").textContent = n;
  $("summaryPrice").textContent = rupees(p);
  $("summaryCalories").textContent = c;
  $("cartCount").textContent = n;
  $("cartCalorieWarning").classList.toggle("hidden", c <= CAP);
  $("floatCalorieValue").textContent = c;
  $("floatCalorieBar").style.width = Math.min(100, (c / BAR) * 100) + "%";

  const level = c <= 800 ? "green" : c <= CAP ? "yellow" : "red";
  $("calorieFloat").className = "calorie-float glass level-" + level;
  $("floatCalorieHint").textContent = !c
    ? "Add items."
    : c > CAP
      ? "Over " + CAP + " kcal."
      : c <= 800
        ? "Light."
        : "Moderate.";
}

function greet() {
  const h = new Date().getHours();
  const part =
    h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  $("greeting").textContent = part + " — hungry?";
}

function rainCode(code) {
  return [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code) ? "rainy" : "clear";
}

function wxType(bucket, temp) {
  return bucket === "rainy" ? "rainy" : temp <= 12 ? "cold" : temp >= 28 ? "hot" : "moderate";
}

function cond(bucket, temp) {
  if (bucket === "rainy") return { l: "Rainy", i: "🌧️" };
  if (temp <= 12) return { l: "Cold", i: "🧣" };
  if (temp >= 28) return { l: "Hot", i: "☀️" };
  return { l: "Pleasant", i: "⛅" };
}

async function wx() {
  try {
    const loc = await (await fetch("https://ipapi.co/json/")).json();
    const d = await (
      await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current_weather=true&timezone=auto`
      )
    ).json();
    const t = d?.current_weather?.temperature ?? 22;
    const cd = d?.current_weather?.weathercode ?? 0;
    const b = rainCode(cd);
    const { l, i } = cond(b, t);
    S.weatherType = wxType(b, t);
    S.conditionLabel = l;
    $("weatherIcon").textContent = i;
    $("weatherTemp").textContent = Math.round(t) + "°C";
    $("weatherCondition").textContent = l;
    $("weatherLocation").textContent = loc.city || "Area";
  } catch {
    S.weatherType = "moderate";
    S.conditionLabel = "Pleasant";
    $("weatherIcon").textContent = "⛅";
    $("weatherTemp").textContent = "—";
    $("weatherCondition").textContent = "Demo";
    $("weatherLocation").textContent = "Nearby";
  }
  $("weatherLoading").classList.add("hidden");
  $("weatherContent").classList.remove("hidden");
  head();
  recs();
  grid();
}

function theme() {
  const dark = localStorage.getItem("hungryhub-theme") === "dark";
  document.body.classList.toggle("dark", dark);
  $("darkModeToggle").textContent = dark ? "☀️" : "🌙";
}

function openCart() {
  if (!S.user) return openAuthModal();
  $("cartPanel").classList.add("open");
  $("cartOverlay").classList.add("visible");
}

function closeCart() {
  $("cartPanel").classList.remove("open");
  $("cartOverlay").classList.remove("visible");
}

/* Events */
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    S.filter = btn.dataset.filter;
    grid();
  });
});

document.querySelectorAll(".mood-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mood-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    S.mood = btn.dataset.mood || "";
    head();
    recs();
  });
});

$("searchInput").oninput = (e) => {
  S.search = e.target.value.trim().toLowerCase();
  grid();
};

$("cartToggle").onclick = openCart;
$("closeCart").onclick = closeCart;
$("cartOverlay").onclick = closeCart;

$("darkModeToggle").onclick = () => {
  const dark = !document.body.classList.contains("dark");
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("hungryhub-theme", dark ? "dark" : "light");
  $("darkModeToggle").textContent = dark ? "☀️" : "🌙";
};

$("exploreBtn").onclick = () => {
  document.querySelector(".items-section").scrollIntoView({ behavior: "smooth" });
};

$("authBtn").onclick = async () => {
  if (!S.user) return openAuthModal();
  S.user = null;
  S.token = "";
  S.cart = [];
  localStorage.removeItem("hungryhub-token");
  updateAuthButton();
  openAuthModal();
  paint();
};

$("loginTab").onclick = () => toggleAuthMode("login");
$("registerTab").onclick = () => toggleAuthMode("register");

$("authForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = $("authName").value.trim();
  const email = $("authEmail").value.trim().toLowerCase();
  const password = $("authPassword").value.trim();

  if (!email || !password) return setAuthMessage("Email and password required.", true);
  if (S.authMode === "register" && !name) return setAuthMessage("Name is required for register.", true);

  try {
    const endpoint = S.authMode === "login" ? "/auth/login" : "/auth/register";
    const payload =
      S.authMode === "login" ? { email, password } : { name, email, password };
    const data = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    S.token = data.token;
    S.user = data.user;
    localStorage.setItem("hungryhub-token", S.token);
    setAuthMessage("Success! Loading your data...");
    closeAuthModal();
    updateAuthButton();
    await loadDataFromDb();
    cats();
    grid();
    recs();
    paint();
  } catch (err) {
    setAuthMessage(err.message || "Login failed.", true);
  }
};

const calorieFloat = $("calorieFloat");
calorieFloat.onclick = openCart;
calorieFloat.onkeydown = (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openCart();
  }
};

theme();
greet();
head();
toggleAuthMode("login");
initializeAuth().then(async (ok) => {
  if (ok) await loadDataFromDb();
  cats();
  grid();
  recs();
  paint();
  wx();
});
