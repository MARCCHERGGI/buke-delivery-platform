export type HomeCategory = "all" | "pizza" | "burgers" | "traditional";

export interface PogradecRestaurant {
  id: string;
  name: string;
  cuisine: string;
  categories: Exclude<HomeCategory, "all">[];
  featuredItem: string;
  deliveryRadiusKm: number;
  etaMinutes: number;
  deliveryFeeAll: number;
  rating: number;
  reviewCount: number;
  priceRange: "$" | "$$" | "$$$";
  distanceKm: number;
}

export const homeCategories: { id: HomeCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pizza", label: "Pizza" },
  { id: "burgers", label: "Burgers" },
  { id: "traditional", label: "Traditional" }
];

export const pogradecRestaurants: PogradecRestaurant[] = [
  {
    id: "casa-di-pizza",
    name: "Casa Di Pizza",
    cuisine: "Italian / Pizza",
    categories: ["pizza"],
    featuredItem: "Pizza Margherita",
    deliveryRadiusKm: 3,
    etaMinutes: 22,
    deliveryFeeAll: 120,
    rating: 4.8,
    reviewCount: 240,
    priceRange: "$$",
    distanceKm: 1.2
  },
  {
    id: "la-casa-pizzeria",
    name: "La Casa Pizzeria",
    cuisine: "Italian / Pizza",
    categories: ["pizza"],
    featuredItem: "Pizza 4 Stinet",
    deliveryRadiusKm: 2.8,
    etaMinutes: 24,
    deliveryFeeAll: 120,
    rating: 4.7,
    reviewCount: 188,
    priceRange: "$$",
    distanceKm: 1.5
  },
  {
    id: "pizza-kupa",
    name: "Pizza Kupa",
    cuisine: "Pizza / Fast Food",
    categories: ["pizza"],
    featuredItem: "Pizza Kupa Mix",
    deliveryRadiusKm: 3,
    etaMinutes: 19,
    deliveryFeeAll: 100,
    rating: 4.6,
    reviewCount: 154,
    priceRange: "$$",
    distanceKm: 0.9
  },
  {
    id: "artist-pizza",
    name: "Artist Pizza",
    cuisine: "Pizza / Italian",
    categories: ["pizza"],
    featuredItem: "Pizza Artist",
    deliveryRadiusKm: 2.7,
    etaMinutes: 21,
    deliveryFeeAll: 100,
    rating: 4.5,
    reviewCount: 126,
    priceRange: "$$",
    distanceKm: 1.1
  },
  {
    id: "swissburger-house",
    name: "Swissburger House",
    cuisine: "Burgers / Fast Food",
    categories: ["burgers"],
    featuredItem: "Swissburger Double",
    deliveryRadiusKm: 2.5,
    etaMinutes: 18,
    deliveryFeeAll: 100,
    rating: 4.7,
    reviewCount: 210,
    priceRange: "$$",
    distanceKm: 0.8
  },
  {
    id: "fast-food-rusi-grill",
    name: "Fast Food Rusi Grill",
    cuisine: "Grill / Fast Food",
    categories: ["burgers", "traditional"],
    featuredItem: "Sufllaqe Pule",
    deliveryRadiusKm: 3,
    etaMinutes: 17,
    deliveryFeeAll: 90,
    rating: 4.4,
    reviewCount: 139,
    priceRange: "$",
    distanceKm: 0.7
  },
  {
    id: "stop-and-go-food",
    name: "Stop and Go Food",
    cuisine: "Fast Food / Street Food",
    categories: ["burgers"],
    featuredItem: "Burger Stop&Go",
    deliveryRadiusKm: 3,
    etaMinutes: 16,
    deliveryFeeAll: 90,
    rating: 4.3,
    reviewCount: 102,
    priceRange: "$",
    distanceKm: 0.6
  },
  {
    id: "restorant-tradita",
    name: "Restorant Tradita",
    cuisine: "Traditional Albanian",
    categories: ["traditional"],
    featuredItem: "Tave Kosi",
    deliveryRadiusKm: 2.6,
    etaMinutes: 25,
    deliveryFeeAll: 140,
    rating: 4.8,
    reviewCount: 196,
    priceRange: "$$",
    distanceKm: 1.7
  },
  {
    id: "restaurant-pogradeci",
    name: "Restaurant Pogradeci",
    cuisine: "Seafood / Albanian",
    categories: ["traditional"],
    featuredItem: "Koran ne Zgare",
    deliveryRadiusKm: 2.4,
    etaMinutes: 26,
    deliveryFeeAll: 150,
    rating: 4.8,
    reviewCount: 222,
    priceRange: "$$$",
    distanceKm: 1.9
  },
  {
    id: "restorant-zgara-familjare",
    name: "Restorant Zgara Familjare",
    cuisine: "Grill / Traditional",
    categories: ["traditional"],
    featuredItem: "Mix Grill Familjare",
    deliveryRadiusKm: 2.5,
    etaMinutes: 23,
    deliveryFeeAll: 120,
    rating: 4.6,
    reviewCount: 144,
    priceRange: "$$",
    distanceKm: 1.4
  },
  {
    id: "bizantin-restaurant",
    name: "Bizantin Restaurant",
    cuisine: "Mediterranean / Seafood",
    categories: ["traditional"],
    featuredItem: "Koran Bizantin",
    deliveryRadiusKm: 2.4,
    etaMinutes: 27,
    deliveryFeeAll: 150,
    rating: 4.7,
    reviewCount: 131,
    priceRange: "$$$",
    distanceKm: 2.1
  },
  {
    id: "taverna-ndona",
    name: "Taverna Ndona",
    cuisine: "Taverna / Albanian / Greek",
    categories: ["traditional"],
    featuredItem: "Berxolla Qengji",
    deliveryRadiusKm: 2.3,
    etaMinutes: 24,
    deliveryFeeAll: 140,
    rating: 4.7,
    reviewCount: 118,
    priceRange: "$$",
    distanceKm: 1.8
  },
  {
    id: "oborri-familjar",
    name: "Oborri Familjar",
    cuisine: "Family Style / Traditional Grill",
    categories: ["traditional"],
    featuredItem: "Mix Grill per 2",
    deliveryRadiusKm: 2,
    etaMinutes: 20,
    deliveryFeeAll: 110,
    rating: 4.6,
    reviewCount: 164,
    priceRange: "$$",
    distanceKm: 1.3
  },
  {
    id: "restaurant-rosa-e-tymosur-villa-borana",
    name: "Restaurant Rosa e Tymosur - Villa Borana",
    cuisine: "Smokehouse / European",
    categories: ["burgers", "traditional"],
    featuredItem: "Burger Villa Borana",
    deliveryRadiusKm: 2.2,
    etaMinutes: 21,
    deliveryFeeAll: 130,
    rating: 4.5,
    reviewCount: 98,
    priceRange: "$$",
    distanceKm: 1.6
  },
  {
    id: "the-change-bar-restaurant",
    name: "THE CHANGE Bar-Restaurant",
    cuisine: "Modern European / Fusion",
    categories: ["burgers"],
    featuredItem: "Beef Burger Deluxe",
    deliveryRadiusKm: 2.4,
    etaMinutes: 22,
    deliveryFeeAll: 140,
    rating: 4.6,
    reviewCount: 136,
    priceRange: "$$$",
    distanceKm: 1.7
  },
  {
    id: "toka-hotel-restaurant",
    name: "Toka Hotel Restaurant",
    cuisine: "Albanian / Mediterranean",
    categories: ["traditional"],
    featuredItem: "Koran Toka",
    deliveryRadiusKm: 2,
    etaMinutes: 24,
    deliveryFeeAll: 130,
    rating: 4.5,
    reviewCount: 87,
    priceRange: "$$$",
    distanceKm: 1.9
  },
  {
    id: "camping-arbi-bar-restaurant",
    name: "Camping Arbi Bar-Restaurant",
    cuisine: "Camping Grill / Casual Albanian",
    categories: ["burgers", "traditional"],
    featuredItem: "Camping Burger",
    deliveryRadiusKm: 2,
    etaMinutes: 19,
    deliveryFeeAll: 110,
    rating: 4.4,
    reviewCount: 73,
    priceRange: "$",
    distanceKm: 1.2
  },
  {
    id: "restorant-varka-lin",
    name: "Restorant Varka Lin",
    cuisine: "Lake Fish / Traditional Albanian",
    categories: ["traditional"],
    featuredItem: "Tave Korani",
    deliveryRadiusKm: 2,
    etaMinutes: 28,
    deliveryFeeAll: 160,
    rating: 4.7,
    reviewCount: 109,
    priceRange: "$$$",
    distanceKm: 2.3
  }
];
