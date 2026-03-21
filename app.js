// Dummy food catalog with tags used for filter and weather suggestions.
const FOOD_ITEMS = [
  { id: "f1", name: "Margherita Pizza", price: 11.99, calories: 780, category: "Pizza", tags: ["high-protein"], image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=900&auto=format&fit=crop" },
  { id: "f2", name: "Chicken Burger", price: 8.49, calories: 640, category: "Burger", tags: ["high-protein"], image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=900&auto=format&fit=crop" },
  { id: "f3", name: "Quinoa Bowl", price: 10.25, calories: 420, category: "Healthy", tags: ["low-calorie", "high-protein"], image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=900&auto=format&fit=crop" },
  { id: "f4", name: "Ice Cream Sundae", price: 5.2, calories: 360, category: "Desserts", tags: ["low-calorie"], image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=900&auto=format&fit=crop" },
  { id: "f5", name: "Tomato Soup", price: 6.1, calories: 210, category: "Soups", tags: ["low-calorie"], image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=900&auto=format&fit=crop" },
  { id: "f6", name: "Iced Mango Juice", price: 4.75, calories: 160, category: "Drinks", tags: ["low-calorie"], image: "https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?q=80&w=900&auto=format&fit=crop" },
  { id: "f7", name: "French Fries", price: 3.99, calories: 420, category: "Snacks", tags: [], image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=900&auto=format&fit=crop" },
  { id: "f8", name: "Cappuccino", price: 3.25, calories: 140, category: "Drinks", tags: ["low-calorie"], image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=900&auto=format&fit=crop" },
  { id: "f9", name: "Protein Wrap", price: 7.8, calories: 390, category: "Healthy", tags: ["high-protein"], image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=900&auto=format&fit=crop" },
  { id: "f10", name: "Chocolate Brownie", price: 4.35, calories: 310, category: "Desserts", tags: [], image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476d?q=80&w=900&auto=format&fit=crop" }
];

const state = {
  category: "All",
  filter: "all",
  search: "",
  cart: JSON.parse(localStorage.getItem("quickbite-cart") || "[]"),
  weatherType: "moderate"
};

const els = {
  categoryList: document.getElementById("categoryList"),
  foodGrid: document.getElementById("foodGrid"),
  recommendedGrid: document.getElementById("recommendedGrid"),
  searchInput: document.getElementById("searchInput"),
  cartItems: document.getElementById("cartItems"),
  summaryItems: document.getElementById("summaryItems"),
  summaryPrice: document.getElementById("summaryPrice"),
  summaryCalories: document.getElementById("summaryCalories"),
  intakeValue: document.getElementById("intakeValue"),
  calorieDashboard: document.getElementById("calorieDashboard"),
  cartCount: document.getElementById("cartCount"),
  cartPanel: document.getElementById("cartPanel"),
  cartToggle: document.getElementById("cartToggle"),
  closeCart: document.getElementById("closeCart"),
  cartOverlay: document.getElementById("cartOverlay"),
  weatherLoading: document.getElementById("weatherLoading"),
  weatherContent: document.getElementById("weatherContent"),
  weatherLocation: document.getElementById("weatherLocation"),
  weatherTemp: document.getElementById("weatherTemp"),
  weatherCondition: document.getElementById("weatherCondition"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  exploreBtn: document.getElementById("exploreBtn"),
  foodCardTemplate: document.getElementById("foodCardTemplate")
};

function setup() {
  initTheme();
  renderCategories();
  renderFoodGrid();
  renderCart();
  attachEvents();
  fetchWeatherAndRecommend();
}

function initTheme() {
  const dark = localStorage.getItem("quickbite-theme") === "dark";
  document.body.classList.toggle("dark", dark);
  els.darkModeToggle.textContent = dark ? "☀️" : "🌙";
}

function attachEvents() {
  els.searchInput.addEventListener("input", (e) => {
    state.search = e.target.value.trim().toLowerCase();
    renderFoodGrid();
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      renderFoodGrid();
    });
  });

  els.cartToggle.addEventListener("click", openCart);
  els.closeCart.addEventListener("click", closeCart);
  els.cartOverlay.addEventListener("click", closeCart);
  els.darkModeToggle.addEventListener("click", toggleDarkMode);
  els.exploreBtn.addEventListener("click", () => {
    document.querySelector(".items-section").scrollIntoView({ behavior: "smooth" });
  });
}

function renderCategories() {
  const categories = ["All", ...new Set(FOOD_ITEMS.map((item) => item.category))];
  els.categoryList.innerHTML = "";

  categories.forEach((category) => {
    const chip = document.createElement("button");
    chip.className = `category-chip ${state.category === category ? "active" : ""}`;
    chip.textContent = category;
    chip.addEventListener("click", () => {
      state.category = category;
      document.querySelectorAll(".category-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderFoodGrid();
    });
    els.categoryList.appendChild(chip);
  });
}

function getFilteredFood(items) {
  return items.filter((item) => {
    const categoryMatch = state.category === "All" || item.category === state.category;
    const searchMatch = item.name.toLowerCase().includes(state.search);
    const filterMatch =
      state.filter === "all" ||
      (state.filter === "low-calorie" && item.tags.includes("low-calorie")) ||
      (state.filter === "high-protein" && item.tags.includes("high-protein"));

    return categoryMatch && searchMatch && filterMatch;
  });
}

function createFoodCard(item, target, buttonText = "Add to cart") {
  const card = els.foodCardTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector(".food-image");
  const name = card.querySelector(".food-name");
  const price = card.querySelector(".food-price");
  const calories = card.querySelector(".food-calories");
  const tagsWrap = card.querySelector(".food-tags");
  const addBtn = card.querySelector(".add-btn");

  image.src = item.image;
  image.alt = item.name;
  name.textContent = item.name;
  price.textContent = `$${item.price.toFixed(2)}`;
  calories.textContent = `${item.calories} kcal`;
  addBtn.textContent = buttonText;

  tagsWrap.innerHTML = "";
  item.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsWrap.appendChild(span);
  });

  addBtn.addEventListener("click", () => {
    addToCart(item.id);
    addBtn.classList.add("added");
    window.setTimeout(() => addBtn.classList.remove("added"), 360);
  });

  target.appendChild(card);
}

function renderFoodGrid() {
  els.foodGrid.innerHTML = "";
  const items = getFilteredFood(FOOD_ITEMS);

  if (items.length === 0) {
    els.foodGrid.innerHTML = "<p>No matching items found.</p>";
    return;
  }

  items.forEach((item) => createFoodCard(item, els.foodGrid));
}

function addToCart(foodId) {
  const existing = state.cart.find((entry) => entry.id === foodId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: foodId, qty: 1 });
  }
  persistCart();
  renderCart();
}

function removeFromCart(foodId) {
  const idx = state.cart.findIndex((entry) => entry.id === foodId);
  if (idx === -1) return;
  if (state.cart[idx].qty > 1) {
    state.cart[idx].qty -= 1;
  } else {
    state.cart.splice(idx, 1);
  }
  persistCart();
  renderCart();
}

function renderCart() {
  els.cartItems.innerHTML = "";
  let totalItems = 0;
  let totalPrice = 0;
  let totalCalories = 0;

  state.cart.forEach((entry) => {
    const item = FOOD_ITEMS.find((food) => food.id === entry.id);
    if (!item) return;

    totalItems += entry.qty;
    totalPrice += item.price * entry.qty;
    totalCalories += item.calories * entry.qty;

    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <p>$${item.price.toFixed(2)} x ${entry.qty} | ${item.calories} kcal</p>
      </div>
      <button class="icon-btn" aria-label="Remove item">−</button>
    `;
    row.querySelector("button").addEventListener("click", () => removeFromCart(item.id));
    els.cartItems.appendChild(row);
  });

  if (state.cart.length === 0) {
    els.cartItems.innerHTML = "<p>Your cart is empty.</p>";
  }

  els.summaryItems.textContent = String(totalItems);
  els.summaryPrice.textContent = totalPrice.toFixed(2);
  els.summaryCalories.textContent = String(totalCalories);
  els.intakeValue.textContent = String(totalCalories);
  els.cartCount.textContent = String(totalItems);

  const level = getCalorieLevel(totalCalories);
  els.calorieDashboard.className = `calorie-dashboard ${level}`;
}

function getCalorieLevel(calories) {
  if (calories <= 1200) return "green";
  if (calories <= 2200) return "yellow";
  return "red";
}

function persistCart() {
  localStorage.setItem("quickbite-cart", JSON.stringify(state.cart));
}

function toggleDarkMode() {
  const nowDark = !document.body.classList.contains("dark");
  document.body.classList.toggle("dark", nowDark);
  localStorage.setItem("quickbite-theme", nowDark ? "dark" : "light");
  els.darkModeToggle.textContent = nowDark ? "☀️" : "🌙";
}

function openCart() {
  els.cartPanel.classList.add("open");
  els.cartOverlay.classList.add("visible");
}

function closeCart() {
  els.cartPanel.classList.remove("open");
  els.cartOverlay.classList.remove("visible");
}

function mapWeatherCodeToCondition(code) {
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  return "clear";
}

function conditionLabel(type, temp) {
  if (type === "rainy") return "Rainy";
  if (temp <= 16) return "Cold";
  if (temp >= 30) return "Hot";
  return "Pleasant";
}

function weatherRecommendationType(type, temp) {
  if (type === "rainy") return "rainy";
  if (temp <= 16) return "cold";
  if (temp >= 30) return "hot";
  return "moderate";
}

function getRecommendedItems(weatherType) {
  if (weatherType === "cold") {
    return FOOD_ITEMS.filter((f) => ["Soups", "Drinks"].includes(f.category) && ["Tomato Soup", "Cappuccino"].includes(f.name));
  }
  if (weatherType === "hot") {
    return FOOD_ITEMS.filter((f) => ["Iced Mango Juice", "Ice Cream Sundae"].includes(f.name));
  }
  if (weatherType === "rainy") {
    return FOOD_ITEMS.filter((f) => f.category === "Snacks" || f.name === "Chicken Burger");
  }
  return FOOD_ITEMS.filter((f) => ["Healthy", "Pizza"].includes(f.category)).slice(0, 3);
}

function renderRecommendations() {
  els.recommendedGrid.innerHTML = "";
  const items = getRecommendedItems(state.weatherType);
  items.forEach((item) => createFoodCard(item, els.recommendedGrid, "Add"));
}

async function fetchWeatherAndRecommend() {
  try {
    // Geolocation from IP + weather from Open-Meteo (public API, no key).
    const locationRes = await fetch("https://ipapi.co/json/");
    const location = await locationRes.json();
    const { latitude, longitude, city } = location;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const temp = weatherData?.current_weather?.temperature ?? 24;
    const weatherCode = weatherData?.current_weather?.weathercode ?? 0;

    const shortCondition = mapWeatherCodeToCondition(weatherCode);
    const condition = conditionLabel(shortCondition, temp);
    state.weatherType = weatherRecommendationType(shortCondition, temp);

    els.weatherLocation.textContent = city || "Your Area";
    els.weatherTemp.textContent = `${temp}°C`;
    els.weatherCondition.textContent = condition;
  } catch (error) {
    // Fallback keeps app functional without network/API availability.
    state.weatherType = "moderate";
    els.weatherLocation.textContent = "Unknown";
    els.weatherTemp.textContent = "N/A";
    els.weatherCondition.textContent = "Pleasant";
  } finally {
    els.weatherLoading.classList.add("hidden");
    els.weatherContent.classList.remove("hidden");
    renderRecommendations();
  }
}

setup();
