const DEMO_USER_ID = "30000000-0000-4000-8000-000000000001";
const DEFAULT_LOCATION = {
  latitude: 40.90247,
  longitude: 20.65696
};
const DELIVERY_FEE_ALL = 120;
const CATEGORY_ORDER = ["all", "pizza", "burgers", "traditional", "seafood", "grill"];
const TIMELINE = [
  { key: "created", label: "Order created" },
  { key: "restaurant_accepted", label: "Restaurant accepted" },
  { key: "driver_assigned", label: "Driver assigned" },
  { key: "driver_arriving", label: "Driver arriving" },
  { key: "picked_up", label: "Picked up" },
  { key: "delivered", label: "Delivered" }
];

const state = {
  restaurants: [],
  menus: new Map(),
  selectedCategory: "all",
  search: "",
  activeRestaurantId: null,
  cart: {
    restaurantId: null,
    items: new Map()
  },
  latestOrder: null,
  orderPollTimer: null
};

const el = {
  healthBadge: document.getElementById("healthBadge"),
  searchInput: document.getElementById("searchInput"),
  addressInput: document.getElementById("addressInput"),
  categoryScroller: document.getElementById("categoryScroller"),
  statRestaurants: document.getElementById("statRestaurants"),
  resultsMeta: document.getElementById("resultsMeta"),
  restaurantGrid: document.getElementById("restaurantGrid"),
  mapPins: document.getElementById("mapPins"),
  cartEmptyState: document.getElementById("cartEmptyState"),
  cartContent: document.getElementById("cartContent"),
  cartRestaurantName: document.getElementById("cartRestaurantName"),
  cartItems: document.getElementById("cartItems"),
  subtotalValue: document.getElementById("subtotalValue"),
  deliveryValue: document.getElementById("deliveryValue"),
  totalValue: document.getElementById("totalValue"),
  placeOrderButton: document.getElementById("placeOrderButton"),
  trackerEmptyState: document.getElementById("trackerEmptyState"),
  trackerContent: document.getElementById("trackerContent"),
  orderIdValue: document.getElementById("orderIdValue"),
  orderEtaValue: document.getElementById("orderEtaValue"),
  timeline: document.getElementById("timeline"),
  refreshOrderButton: document.getElementById("refreshOrderButton"),
  restaurantDialog: document.getElementById("restaurantDialog"),
  dialogContent: document.getElementById("dialogContent"),
  closeDialogButton: document.getElementById("closeDialogButton"),
  toast: document.getElementById("toast")
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? "Request failed";
    throw new Error(message);
  }

  return payload.data;
};

const formatMoney = (value) => `${Number(value).toLocaleString("en-US")} ALL`;

const slugifyCategory = (restaurant) => {
  const cuisine = restaurant.cuisineType.toLowerCase();
  if (cuisine.includes("pizza")) return "pizza";
  if (cuisine.includes("burger")) return "burgers";
  if (cuisine.includes("traditional") || cuisine.includes("albanian") || cuisine.includes("taverna")) {
    return "traditional";
  }
  if (cuisine.includes("seafood") || cuisine.includes("fish")) return "seafood";
  if (cuisine.includes("grill")) return "grill";
  return "all";
};

const deterministicScore = (text) => {
  let score = 0;
  for (const char of text) {
    score += char.charCodeAt(0);
  }
  return score;
};

const restaurantMeta = (restaurant) => {
  const seed = deterministicScore(restaurant.name);
  return {
    rating: (4.1 + (seed % 8) / 10).toFixed(1),
    eta: `${Math.max(12, restaurant.prepTimeMinutes - 2)}-${restaurant.prepTimeMinutes + 6} min`,
    fee: `${Math.round(restaurant.deliveryRadiusM / 1000 * 40)} ALL`
  };
};

const getRestaurantById = (restaurantId) =>
  state.restaurants.find((restaurant) => restaurant.id === restaurantId) ?? null;

const getFilteredRestaurants = () => {
  const term = state.search.trim().toLowerCase();

  return state.restaurants.filter((restaurant) => {
    const category = slugifyCategory(restaurant);
    const matchesCategory = state.selectedCategory === "all" || category === state.selectedCategory;
    const haystack = [
      restaurant.name,
      restaurant.cuisineType,
      restaurant.addressText
    ]
      .join(" ")
      .toLowerCase();

    return matchesCategory && (!term || haystack.includes(term));
  });
};

const showToast = (message) => {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    el.toast.classList.add("hidden");
  }, 2400);
};

const renderCategories = () => {
  const labels = {
    all: "All",
    pizza: "Pizza",
    burgers: "Burgers",
    traditional: "Traditional",
    seafood: "Seafood",
    grill: "Grill"
  };

  el.categoryScroller.innerHTML = CATEGORY_ORDER.map(
    (category) => `
      <button
        class="category-chip ${category === state.selectedCategory ? "is-active" : ""}"
        type="button"
        data-action="set-category"
        data-category="${category}"
      >
        ${labels[category]}
      </button>
    `
  ).join("");
};

const renderMapPins = (restaurants) => {
  const cityRestaurants = restaurants.filter((restaurant) => Number(restaurant.latitude) > 40.89);
  if (!cityRestaurants.length) {
    el.mapPins.innerHTML = "";
    return;
  }

  const latitudes = cityRestaurants.map((restaurant) => Number(restaurant.latitude));
  const longitudes = cityRestaurants.map((restaurant) => Number(restaurant.longitude));
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latRange = Math.max(0.001, maxLat - minLat);
  const lngRange = Math.max(0.001, maxLng - minLng);

  el.mapPins.innerHTML = cityRestaurants
    .map((restaurant) => {
      const lat = Number(restaurant.latitude);
      const lng = Number(restaurant.longitude);
      const top = 18 + ((maxLat - lat) / latRange) * 58;
      const left = 18 + ((lng - minLng) / lngRange) * 46;
      const activeClass = restaurant.id === state.activeRestaurantId ? "is-active" : "";

      return `
        <button
          class="map-pin ${activeClass}"
          type="button"
          title="${restaurant.name}"
          style="top:${top}%;left:${left}%;"
          data-action="open-restaurant"
          data-restaurant-id="${restaurant.id}"
        ></button>
      `;
    })
    .join("");
};

const renderRestaurants = () => {
  const restaurants = getFilteredRestaurants();
  el.statRestaurants.textContent = String(state.restaurants.length);
  el.resultsMeta.textContent = `${restaurants.length} restaurants matching your feed`;

  if (!restaurants.length) {
    el.restaurantGrid.innerHTML = `
      <div class="empty-state">
        <p>No restaurants match that search. Try a broader cuisine or clear the search field.</p>
      </div>
    `;
    renderMapPins(state.restaurants);
    return;
  }

  el.restaurantGrid.innerHTML = restaurants
    .map((restaurant) => {
      const meta = restaurantMeta(restaurant);
      const category = slugifyCategory(restaurant);
      return `
        <article class="restaurant-card">
          <div class="restaurant-header">
            <div>
              <p class="eyebrow">${category}</p>
              <h4 class="restaurant-name">${restaurant.name}</h4>
            </div>
            <span class="rating-pill">★ ${meta.rating}</span>
          </div>

          <p class="restaurant-address">${restaurant.addressText}</p>

          <div class="restaurant-meta">
            <span class="restaurant-tag">${restaurant.cuisineType}</span>
            <span class="restaurant-tag">${meta.fee} delivery</span>
          </div>

          <div class="restaurant-actions">
            <span class="restaurant-time">${meta.eta}</span>
            <button
              class="ghost-button"
              type="button"
              data-action="open-restaurant"
              data-restaurant-id="${restaurant.id}"
            >
              View menu
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  renderMapPins(restaurants);
};

const renderCart = () => {
  const restaurant = getRestaurantById(state.cart.restaurantId);
  const entries = Array.from(state.cart.items.values());

  if (!restaurant || !entries.length) {
    el.cartEmptyState.classList.remove("hidden");
    el.cartContent.classList.add("hidden");
    return;
  }

  const subtotal = entries.reduce((sum, item) => sum + item.priceAmountAll * item.quantity, 0);
  const total = subtotal + DELIVERY_FEE_ALL;

  el.cartEmptyState.classList.add("hidden");
  el.cartContent.classList.remove("hidden");
  el.cartRestaurantName.textContent = restaurant.name;
  el.cartItems.innerHTML = entries
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-line">
            <div>
              <div class="cart-item-name">${item.name}</div>
              <div class="restaurant-meta-line">${formatMoney(item.priceAmountAll)} each</div>
            </div>
            <strong>${formatMoney(item.priceAmountAll * item.quantity)}</strong>
          </div>
          <div class="cart-line">
            <div class="qty-controls">
              <button class="qty-button" type="button" data-action="decrement-item" data-menu-item-id="${item.id}">−</button>
              <strong>${item.quantity}</strong>
              <button class="qty-button" type="button" data-action="increment-item" data-menu-item-id="${item.id}">+</button>
            </div>
            <button class="ghost-button" type="button" data-action="remove-item" data-menu-item-id="${item.id}">
              Remove
            </button>
          </div>
        </article>
      `
    )
    .join("");

  el.subtotalValue.textContent = formatMoney(subtotal);
  el.deliveryValue.textContent = formatMoney(DELIVERY_FEE_ALL);
  el.totalValue.textContent = formatMoney(total);
};

const renderTracker = () => {
  const order = state.latestOrder;
  if (!order) {
    el.trackerEmptyState.classList.remove("hidden");
    el.trackerContent.classList.add("hidden");
    return;
  }

  el.trackerEmptyState.classList.add("hidden");
  el.trackerContent.classList.remove("hidden");
  el.orderIdValue.textContent = order.id.slice(0, 8).toUpperCase();

  const restaurant = getRestaurantById(order.restaurantId);
  const baseEta = restaurant ? restaurant.prepTimeMinutes + 6 : 18;
  const currentIndex = TIMELINE.findIndex((step) => step.key === order.status);
  const eta = order.status === "delivered" ? "Delivered" : `ETA ${Math.max(4, baseEta - Math.max(currentIndex, 0) * 3)} min`;
  el.orderEtaValue.textContent = eta;

  el.timeline.innerHTML = TIMELINE.map((step, index) => {
    const isComplete = currentIndex > index || order.status === "delivered";
    const isCurrent = currentIndex === index && order.status !== "delivered";
    const className = `timeline-step ${isComplete ? "is-complete" : ""} ${isCurrent ? "is-current" : ""}`.trim();
    return `
      <div class="${className}">
        <div class="timeline-dot"></div>
        <div class="timeline-copy">
          <strong>${step.label}</strong>
          <span>${isComplete || isCurrent ? "Active in Bukë" : "Waiting"}</span>
        </div>
      </div>
    `;
  }).join("");
};

const groupMenu = (menu) => {
  const sections = new Map();
  for (const item of menu) {
    if (!sections.has(item.category)) {
      sections.set(item.category, []);
    }
    sections.get(item.category).push(item);
  }
  return Array.from(sections.entries());
};

const renderDialog = (restaurant, menuData) => {
  const meta = restaurantMeta(restaurant);
  const groupedMenu = groupMenu(menuData.menu);

  el.dialogContent.innerHTML = `
    <div class="dialog-hero">
      <p class="eyebrow">${restaurant.cuisineType}</p>
      <h2>${restaurant.name}</h2>
      <div class="restaurant-meta">
        <span class="rating-pill">★ ${meta.rating}</span>
        <span class="restaurant-tag">${meta.eta}</span>
        <span class="restaurant-tag">${formatMoney(DELIVERY_FEE_ALL)} delivery</span>
      </div>
      <p class="restaurant-address">${restaurant.addressText}</p>
    </div>

    <div class="dialog-subgrid">
      <div class="menu-sections">
        ${groupedMenu
          .map(
            ([sectionName, items]) => `
              <section class="menu-section">
                <h4>${sectionName}</h4>
                ${items
                  .map(
                    (item) => `
                      <article class="menu-item">
                        <div>
                          <strong>${item.name}</strong>
                          <div class="menu-description">${item.description ?? "Freshly prepared for Bukë."}</div>
                        </div>
                        <div class="menu-item-right">
                          <span class="menu-price">${formatMoney(item.priceAmountAll)}</span>
                          <button
                            class="add-button"
                            type="button"
                            data-action="add-item"
                            data-restaurant-id="${restaurant.id}"
                            data-menu-item-id="${item.id}"
                          >
                            Add
                          </button>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </section>
            `
          )
          .join("")}
      </div>

      <aside class="restaurant-summary-card">
        <div>
          <p class="eyebrow">Fast path</p>
          <h3>3 taps to place an order.</h3>
        </div>
        <p>
          Add from the menu, keep the address in the header, and checkout from the sticky cart.
        </p>
        <div class="summary-pills">
          <span>Open now</span>
          <span>${restaurant.deliveryRadiusM / 1000} km radius</span>
          <span>${restaurant.prepTimeMinutes} min prep</span>
        </div>
      </aside>
    </div>
  `;
};

const setHealth = (label, className) => {
  el.healthBadge.textContent = label;
  el.healthBadge.className = `health-badge ${className ?? ""}`.trim();
};

const ensureSingleRestaurantCart = (restaurantId) => {
  if (!state.cart.restaurantId || state.cart.restaurantId === restaurantId) {
    return true;
  }

  const currentRestaurant = getRestaurantById(state.cart.restaurantId);
  const confirmed = window.confirm(
    `Your cart already contains items from ${currentRestaurant?.name ?? "another restaurant"}. Clear it and switch?`
  );

  if (!confirmed) {
    return false;
  }

  state.cart.restaurantId = null;
  state.cart.items = new Map();
  return true;
};

const addItemToCart = (restaurantId, menuItemId) => {
  if (!ensureSingleRestaurantCart(restaurantId)) {
    return;
  }

  const menuData = state.menus.get(restaurantId);
  const menuItem = menuData?.menu.find((item) => item.id === menuItemId);
  if (!menuItem) {
    showToast("Menu item unavailable");
    return;
  }

  state.cart.restaurantId = restaurantId;
  const existing = state.cart.items.get(menuItemId);
  state.cart.items.set(menuItemId, {
    ...menuItem,
    quantity: existing ? existing.quantity + 1 : 1
  });

  renderCart();
  showToast(`${menuItem.name} added`);
};

const updateCartQuantity = (menuItemId, delta) => {
  const current = state.cart.items.get(menuItemId);
  if (!current) return;

  const nextQuantity = current.quantity + delta;
  if (nextQuantity <= 0) {
    state.cart.items.delete(menuItemId);
  } else {
    state.cart.items.set(menuItemId, {
      ...current,
      quantity: nextQuantity
    });
  }

  if (!state.cart.items.size) {
    state.cart.restaurantId = null;
  }

  renderCart();
};

const openRestaurant = async (restaurantId) => {
  const restaurant = getRestaurantById(restaurantId);
  if (!restaurant) return;

  state.activeRestaurantId = restaurantId;
  renderRestaurants();

  let menuData = state.menus.get(restaurantId);
  if (!menuData) {
    el.dialogContent.innerHTML = `<div class="empty-state"><p>Loading menu...</p></div>`;
    if (!el.restaurantDialog.open) {
      el.restaurantDialog.showModal();
    }
    try {
      menuData = await apiFetch(`/restaurants/${restaurantId}/menu`);
      state.menus.set(restaurantId, menuData);
    } catch (error) {
      showToast(error.message);
      return;
    }
  }

  renderDialog(restaurant, menuData);
  if (!el.restaurantDialog.open) {
    el.restaurantDialog.showModal();
  }
};

const refreshOrder = async () => {
  if (!state.latestOrder?.id) return;

  try {
    state.latestOrder = await apiFetch(`/orders/${state.latestOrder.id}`);
    renderTracker();
  } catch (error) {
    showToast(error.message);
  }
};

const startOrderPolling = () => {
  window.clearInterval(state.orderPollTimer);
  state.orderPollTimer = window.setInterval(refreshOrder, 5000);
};

const placeOrder = async () => {
  const restaurantId = state.cart.restaurantId;
  const items = Array.from(state.cart.items.values());

  if (!restaurantId || !items.length) {
    showToast("Add items first");
    return;
  }

  const payload = {
    userId: DEMO_USER_ID,
    restaurantId,
    customerAddressText: el.addressInput.value.trim(),
    customerLatitude: DEFAULT_LOCATION.latitude,
    customerLongitude: DEFAULT_LOCATION.longitude,
    customerNote: "Created from Bukë web demo",
    deliveryFeeAll: DELIVERY_FEE_ALL,
    items: items.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity
    }))
  };

  el.placeOrderButton.disabled = true;
  el.placeOrderButton.textContent = "Placing...";

  try {
    state.latestOrder = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    state.cart.restaurantId = null;
    state.cart.items = new Map();
    renderCart();
    renderTracker();
    startOrderPolling();
    showToast("Order created");
  } catch (error) {
    showToast(error.message);
  } finally {
    el.placeOrderButton.disabled = false;
    el.placeOrderButton.textContent = "Place order";
  }
};

const handleClick = async (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const { action, category, restaurantId, menuItemId } = actionTarget.dataset;

  if (action === "set-category") {
    state.selectedCategory = category;
    renderCategories();
    renderRestaurants();
  }

  if (action === "open-restaurant") {
    await openRestaurant(restaurantId);
  }

  if (action === "add-item") {
    addItemToCart(restaurantId, menuItemId);
  }

  if (action === "increment-item") {
    updateCartQuantity(menuItemId, 1);
  }

  if (action === "decrement-item") {
    updateCartQuantity(menuItemId, -1);
  }

  if (action === "remove-item") {
    state.cart.items.delete(menuItemId);
    if (!state.cart.items.size) {
      state.cart.restaurantId = null;
    }
    renderCart();
  }
};

const init = async () => {
  renderCategories();
  renderCart();
  renderTracker();

  document.addEventListener("click", handleClick);
  el.closeDialogButton.addEventListener("click", () => el.restaurantDialog.close());
  el.restaurantDialog.addEventListener("click", (event) => {
    if (event.target === el.restaurantDialog) {
      el.restaurantDialog.close();
    }
  });
  el.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderRestaurants();
  });
  el.placeOrderButton.addEventListener("click", placeOrder);
  el.refreshOrderButton.addEventListener("click", refreshOrder);

  try {
    await apiFetch("/health");
    setHealth("Backend healthy");
  } catch (error) {
    setHealth("Backend unavailable", "is-error");
    showToast(error.message);
  }

  try {
    state.restaurants = await apiFetch("/restaurants");
    renderRestaurants();
  } catch (error) {
    el.resultsMeta.textContent = "Could not load restaurants";
    el.restaurantGrid.innerHTML = `<div class="empty-state"><p>${error.message}</p></div>`;
  }
};

init();
