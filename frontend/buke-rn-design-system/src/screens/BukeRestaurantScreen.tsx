import React, { startTransition, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  CartPanel,
  CategoryScroller,
  DeliveryETAWidget,
  MenuItemCard,
  RatingBadge
} from "../components";
import { TextLine } from "../components/shared";
import {
  getRestaurantPageData,
  RestaurantMenuSection
} from "../data/pogradecRestaurantMenus";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";

export interface BukeRestaurantScreenProps {
  restaurantId?: string;
}

export const BukeRestaurantScreen = ({
  restaurantId = "casa-di-pizza"
}: BukeRestaurantScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);
  const pageData = getRestaurantPageData(restaurantId);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(
    pageData?.sections[0]?.id
  );
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  if (!restaurant || !pageData) {
    return (
      <View
        style={[
          styles.emptyScreen,
          {
            backgroundColor: theme.colors.surface.canvas
          }
        ]}
      >
        <TextLine style={theme.typography.title}>Restaurant not found</TextLine>
      </View>
    );
  }

  const sectionCategories = pageData.sections.map((section) => ({
    id: section.id,
    label: section.title
  }));

  const cartSummary = pageData.sections
    .flatMap((section) => section.items)
    .reduce(
      (summary, item) => {
        const quantity = cartQuantities[item.id] ?? 0;
        return {
          itemCount: summary.itemCount + quantity,
          subtotalAll: summary.subtotalAll + quantity * item.priceAll
        };
      },
      {
        itemCount: 0,
        subtotalAll: 0
      }
    );

  const visibleSections = selectedSectionId
    ? pageData.sections.filter((section) => section.id === selectedSectionId)
    : pageData.sections;

  const handleAddToCart = (section: RestaurantMenuSection, itemId: string) => {
    const item = section.items.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    startTransition(() => {
      setCartQuantities((current) => ({
        ...current,
        [itemId]: (current[itemId] ?? 0) + 1
      }));
    });
  };

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
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: cartSummary.itemCount > 0 ? 220 : 48
          }
        ]}
      >
        <View
          style={[
            styles.headerHero,
            {
              backgroundColor: theme.colors.brand.primaryMuted,
              borderBottomLeftRadius: theme.radii.xl,
              borderBottomRightRadius: theme.radii.xl
            }
          ]}
        >
          <View
            style={[
              styles.heroBadge,
              {
                backgroundColor: theme.colors.surface.base,
                borderRadius: theme.radii.pill
              }
            ]}
          >
            <TextLine style={theme.typography.micro}>Pogradec</TextLine>
          </View>
          <TextLine style={theme.typography.display}>{restaurant.name}</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            {pageData.headerNote}
          </TextLine>
          <View style={styles.headerMetaRow}>
            <RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
            <View
              style={[
                styles.metaChip,
                {
                  backgroundColor: theme.colors.surface.base,
                  borderColor: theme.colors.border.subtle,
                  borderRadius: theme.radii.pill
                }
              ]}
            >
              <TextLine style={theme.typography.label}>{restaurant.priceRange}</TextLine>
            </View>
            <View
              style={[
                styles.metaChip,
                {
                  backgroundColor: theme.colors.surface.base,
                  borderColor: theme.colors.border.subtle,
                  borderRadius: theme.radii.pill
                }
              ]}
            >
              <TextLine style={theme.typography.label}>
                {restaurant.distanceKm.toFixed(1)} km
              </TextLine>
            </View>
          </View>
        </View>

        <View style={styles.stack}>
          <DeliveryETAWidget
            etaMinutes={restaurant.etaMinutes}
            stateLabel="Delivery time"
            feeLabel={`${restaurant.deliveryFeeAll} ALL delivery`}
          />

          <View style={styles.sectionHeader}>
            <TextLine style={theme.typography.title}>Menu</TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              Pick items and add them straight into the cart.
            </TextLine>
          </View>

          <CategoryScroller
            categories={sectionCategories}
            selectedId={selectedSectionId}
            onSelect={(id) => {
              startTransition(() => {
                setSelectedSectionId(id);
              });
            }}
          />

          {visibleSections.map((section) => (
            <View key={section.id} style={styles.menuSection}>
              <View style={styles.menuSectionHeader}>
                <TextLine style={theme.typography.headline}>{section.title}</TextLine>
                <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
                  {section.items.length} items
                </TextLine>
              </View>
              <View
                style={[
                  styles.menuSectionCard,
                  {
                    backgroundColor: theme.colors.surface.base,
                    borderColor: theme.colors.border.subtle,
                    borderRadius: theme.radii.lg
                  }
                ]}
              >
                {section.items.map((item) => (
                  <View key={item.id}>
                    <MenuItemCard
                      name={item.name}
                      description={item.description}
                      priceAll={item.priceAll}
                      tagLabel={item.tagLabel}
                      onAdd={() => handleAddToCart(section, item.id)}
                    />
                    {(cartQuantities[item.id] ?? 0) > 0 ? (
                      <View style={styles.quantityRow}>
                        <TextLine
                          style={theme.typography.caption}
                          color={theme.colors.text.secondary}
                        >
                          Added {(cartQuantities[item.id] ?? 0)}x
                        </TextLine>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {cartSummary.itemCount > 0 ? (
        <CartPanel
          itemCount={cartSummary.itemCount}
          subtotalAll={cartSummary.subtotalAll}
          deliveryFeeAll={restaurant.deliveryFeeAll}
          etaLabel={`in ${restaurant.etaMinutes} min`}
          ctaLabel="Review cart"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  content: {
    gap: 18
  },
  headerHero: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 10
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  headerMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    marginTop: 6
  },
  metaChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  stack: {
    paddingHorizontal: 16,
    gap: 18
  },
  sectionHeader: {
    gap: 4
  },
  menuSection: {
    gap: 10
  },
  menuSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  menuSectionCard: {
    borderWidth: 1,
    overflow: "hidden"
  },
  quantityRow: {
    paddingHorizontal: 18,
    paddingBottom: 10
  }
});
