import React, { startTransition, useDeferredValue, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { CategoryScroller, DeliveryETAWidget, RestaurantCard, SearchBar } from "../components";
import { useBukeTheme } from "../theme";
import {
  HomeCategory,
  homeCategories,
  pogradecRestaurants
} from "../data/pogradecRestaurants";
import { TextLine } from "../components/shared";

const isHomeCategory = (value: string): value is HomeCategory =>
  homeCategories.some((category) => category.id === value);

export interface BukeHomeScreenProps {
  deliveryAddress?: string;
}

export const BukeHomeScreen = ({
  deliveryAddress = "Rruga Reshit Collaku, Pogradec"
}: BukeHomeScreenProps) => {
  const theme = useBukeTheme();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HomeCategory>("all");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredRestaurants = pogradecRestaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === "all" || restaurant.categories.includes(selectedCategory);

    if (!matchesCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchIndex = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.featuredItem,
      ...restaurant.categories
    ]
      .join(" ")
      .toLowerCase();

    return searchIndex.includes(normalizedQuery);
  });

  const averageEta = filteredRestaurants.length
    ? Math.round(
        filteredRestaurants.reduce((sum, restaurant) => sum + restaurant.etaMinutes, 0) /
          filteredRestaurants.length
      )
    : 0;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.surface.canvas
        }
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerBlock}>
          <TextLine style={theme.typography.micro} color={theme.colors.text.secondary}>
            Deliver now
          </TextLine>
          <Pressable
            style={[
              styles.addressChip,
              {
                backgroundColor: theme.colors.surface.base,
                borderColor: theme.colors.border.subtle,
                borderRadius: theme.radii.pill
              }
            ]}
          >
            <TextLine style={theme.typography.label} numberOfLines={1}>
              {deliveryAddress}
            </TextLine>
          </Pressable>
          <TextLine style={theme.typography.display}>What should we bring?</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Live delivery in Pogradec from pizza, burgers, and traditional kitchens.
          </TextLine>
        </View>

        <SearchBar
          value={query}
          onChangeText={(value) => {
            startTransition(() => {
              setQuery(value);
            });
          }}
        />

        <CategoryScroller
          categories={homeCategories}
          selectedId={selectedCategory}
          onSelect={(id) => {
            if (!isHomeCategory(id)) {
              return;
            }

            startTransition(() => {
              setSelectedCategory(id);
            });
          }}
        />

        <DeliveryETAWidget
          etaMinutes={averageEta || 18}
          stateLabel={`${filteredRestaurants.length} open now`}
          feeLabel="Typical delivery 90-160 ALL"
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionCopy}>
            <TextLine style={theme.typography.title}>Pogradec picks</TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              Sorted for fast delivery within Bukë's 3 km radius.
            </TextLine>
          </View>
        </View>

        <View style={styles.list}>
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              name={restaurant.name}
              cuisine={`${restaurant.cuisine} · ${restaurant.featuredItem}`}
              etaMinutes={restaurant.etaMinutes}
              feeLabel={`${restaurant.deliveryFeeAll} ALL delivery`}
              rating={restaurant.rating}
              reviewCount={restaurant.reviewCount}
              priceRange={restaurant.priceRange}
              distanceLabel={`${restaurant.distanceKm.toFixed(1)} km`}
            />
          ))}
        </View>

        {filteredRestaurants.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                backgroundColor: theme.colors.surface.base,
                borderColor: theme.colors.border.subtle,
                borderRadius: theme.radii.lg
              }
            ]}
          >
            <TextLine style={theme.typography.headline}>No matches</TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              Try another search or switch back to a broader category.
            </TextLine>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 18
  },
  headerBlock: {
    gap: 10
  },
  addressChip: {
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignSelf: "flex-start",
    maxWidth: "100%"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  sectionCopy: {
    flex: 1,
    gap: 4
  },
  list: {
    gap: 16
  },
  emptyState: {
    borderWidth: 1,
    padding: 20,
    gap: 6
  }
});
