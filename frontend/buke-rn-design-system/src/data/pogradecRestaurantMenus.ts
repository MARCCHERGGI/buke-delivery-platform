import { PogradecRestaurant, pogradecRestaurants } from "./pogradecRestaurants";

export interface RestaurantMenuItem {
  id: string;
  name: string;
  description: string;
  priceAll: number;
  tagLabel?: string;
}

export interface RestaurantMenuSection {
  id: string;
  title: string;
  items: RestaurantMenuItem[];
}

export interface RestaurantPageData {
  headerNote: string;
  sections: RestaurantMenuSection[];
}

const restaurantPageDataById: Record<string, RestaurantPageData> = {
  "casa-di-pizza": {
    headerNote: "Thin crust pizzas and quick delivery from central Pogradec.",
    sections: [
      {
        id: "popular",
        title: "Popular",
        items: [
          {
            id: "margherita",
            name: "Pizza Margherita",
            description: "Tomato sauce, mozzarella, basil, extra virgin olive oil.",
            priceAll: 750,
            tagLabel: "Best seller"
          },
          {
            id: "prosciutto-funghi",
            name: "Pizza Prosciutto e Funghi",
            description: "Ham, mushrooms, mozzarella, house tomato sauce.",
            priceAll: 920
          },
          {
            id: "diavola",
            name: "Pizza Diavola",
            description: "Spicy salami, tomato sauce, mozzarella, chili flakes.",
            priceAll: 950,
            tagLabel: "Hot"
          }
        ]
      },
      {
        id: "pasta",
        title: "Pasta",
        items: [
          {
            id: "penne-arrabbiata",
            name: "Penne Arrabbiata",
            description: "Garlic, tomato, chili, parsley, pecorino finish.",
            priceAll: 650
          },
          {
            id: "carbonara",
            name: "Spaghetti Carbonara",
            description: "Egg yolk cream, pancetta, black pepper, parmesan.",
            priceAll: 720
          }
        ]
      },
      {
        id: "sides",
        title: "Sides and desserts",
        items: [
          {
            id: "bruschetta",
            name: "Bruschetta",
            description: "Grilled bread, tomato, basil, olive oil.",
            priceAll: 350
          },
          {
            id: "tiramisu",
            name: "Tiramisu",
            description: "Classic mascarpone cream dessert.",
            priceAll: 450
          }
        ]
      }
    ]
  },
  "swissburger-house": {
    headerNote: "Fast burger kitchen with short prep times and loaded fries.",
    sections: [
      {
        id: "burgers",
        title: "Burgers",
        items: [
          {
            id: "classic",
            name: "Swissburger Classic",
            description: "Beef patty, cheddar, pickles, lettuce, burger sauce.",
            priceAll: 650,
            tagLabel: "Popular"
          },
          {
            id: "double",
            name: "Swissburger Double",
            description: "Double beef, double cheddar, caramelized onions, sauce.",
            priceAll: 850
          },
          {
            id: "crispy-chicken",
            name: "Crispy Chicken Burger",
            description: "Crispy chicken fillet, slaw, pickles, garlic mayo.",
            priceAll: 620
          }
        ]
      },
      {
        id: "sides",
        title: "Sides",
        items: [
          {
            id: "loaded-fries",
            name: "Loaded Fries",
            description: "Fries with cheddar sauce, crispy onions, herbs.",
            priceAll: 350
          },
          {
            id: "onion-rings",
            name: "Onion Rings",
            description: "Golden fried onion rings with spicy dip.",
            priceAll: 300
          }
        ]
      }
    ]
  },
  "restorant-tradita": {
    headerNote: "Classic Albanian comfort food with family-size portions.",
    sections: [
      {
        id: "traditional",
        title: "Traditional plates",
        items: [
          {
            id: "tave-kosi",
            name: "Tave Kosi",
            description: "Baked lamb, yogurt, rice, and a rich village-style sauce.",
            priceAll: 850,
            tagLabel: "House favorite"
          },
          {
            id: "fergese",
            name: "Fergese Tirane",
            description: "Roasted peppers, tomatoes, cottage cheese, herbs.",
            priceAll: 700
          },
          {
            id: "tave-dheu",
            name: "Tave Dheu",
            description: "Clay pot casserole with beef, peppers, and cheese.",
            priceAll: 850
          }
        ]
      },
      {
        id: "grill",
        title: "From the grill",
        items: [
          {
            id: "qofte",
            name: "Qofte Shtepie",
            description: "Home-style meatballs with grilled vegetables.",
            priceAll: 650
          },
          {
            id: "mix-grill",
            name: "Tradita Mix Grill",
            description: "Qofte, sausage, chicken, and village potatoes.",
            priceAll: 1200
          }
        ]
      }
    ]
  }
};

const buildFallbackSections = (restaurant: PogradecRestaurant): RestaurantPageData => ({
  headerNote: `Fast delivery from ${restaurant.name} in the ${restaurant.cuisine.toLowerCase()} category.`,
  sections: [
    {
      id: "featured",
      title: "Featured",
      items: [
        {
          id: `${restaurant.id}-featured`,
          name: restaurant.featuredItem,
          description: `${restaurant.cuisine} favorite prepared for quick Buk e delivery.`,
          priceAll: Math.max(restaurant.deliveryFeeAll * 5, 550),
          tagLabel: "Recommended"
        }
      ]
    },
    {
      id: "kitchen-picks",
      title: "Kitchen picks",
      items: [
        {
          id: `${restaurant.id}-combo`,
          name: `${restaurant.name} Combo`,
          description: `A reliable best-of order from ${restaurant.name}.`,
          priceAll: Math.max(restaurant.deliveryFeeAll * 8, 820)
        },
        {
          id: `${restaurant.id}-side`,
          name: "Side and drink",
          description: "Simple add-on to complete the order.",
          priceAll: 250
        }
      ]
    }
  ]
});

export const getRestaurantPageData = (
  restaurantId: string
): RestaurantPageData | undefined => {
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);

  if (!restaurant) {
    return undefined;
  }

  return restaurantPageDataById[restaurantId] ?? buildFallbackSections(restaurant);
};
