import React, { startTransition, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { CartItemRow, DeliveryETAWidget } from "../components";
import { PrimaryButton, Surface, TextLine } from "../components/shared";
import { getRestaurantPageData } from "../data/pogradecRestaurantMenus";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";
import { formatAll } from "../utils/format";

export interface BukeCartItemInput {
  itemId: string;
  quantity: number;
}

export interface BukeCartScreenProps {
  restaurantId?: string;
  cartItems?: BukeCartItemInput[];
  onPlaceOrder?: () => void;
}

export const BukeCartScreen = ({
  restaurantId = "casa-di-pizza",
  cartItems,
  onPlaceOrder
}: BukeCartScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);
  const pageData = getRestaurantPageData(restaurantId);

  const initialQuantities = (cartItems ?? buildDefaultCart(pageData)).reduce<Record<string, number>>(
    (accumulator, entry) => {
      if (entry.quantity > 0) {
        accumulator[entry.itemId] = entry.quantity;
      }

      return accumulator;
    },
    {}
  );

  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);

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
        <TextLine style={theme.typography.title}>Cart unavailable</TextLine>
      </View>
    );
  }

  const cartItemsData = pageData.sections
    .flatMap((section) =>
      section.items
        .filter((item) => (quantities[item.id] ?? 0) > 0)
        .map((item) => ({
          ...item,
          sectionTitle: section.title,
          quantity: quantities[item.id] ?? 0
        }))
    )
    .sort((left, right) => right.quantity - left.quantity);

  const subtotalAll = cartItemsData.reduce(
    (sum, item) => sum + item.quantity * item.priceAll,
    0
  );
  const totalItems = cartItemsData.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFeeAll = restaurant.deliveryFeeAll;
  const totalAll = subtotalAll + deliveryFeeAll;
  const placeOrderButtonStyle =
    cartItemsData.length === 0
      ? [styles.placeOrderButton, styles.placeOrderButtonDisabled]
      : styles.placeOrderButton;

  const updateQuantity = (itemId: string, delta: number) => {
    startTransition(() => {
      setQuantities((current) => {
        const nextQuantity = Math.max((current[itemId] ?? 0) + delta, 0);

        if (nextQuantity === 0) {
          const { [itemId]: _removed, ...rest } = current;
          return rest;
        }

        return {
          ...current,
          [itemId]: nextQuantity
        };
      });
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
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
            Cart
          </TextLine>
          <TextLine style={theme.typography.display}>{restaurant.name}</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Review items, confirm totals, and place the order in one tap.
          </TextLine>
        </View>

        <DeliveryETAWidget
          etaMinutes={restaurant.etaMinutes}
          stateLabel="Delivery estimate"
          feeLabel={`${restaurant.deliveryFeeAll} ALL delivery`}
        />

        <Surface style={styles.itemCard}>
          <View style={styles.cardHeader}>
            <TextLine style={theme.typography.title}>Items</TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              {totalItems} items
            </TextLine>
          </View>

          {cartItemsData.length > 0 ? (
            cartItemsData.map((item) => (
              <CartItemRow
                key={item.id}
                name={item.name}
                sectionLabel={item.sectionTitle}
                unitPriceAll={item.priceAll}
                quantity={item.quantity}
                onIncrement={() => updateQuantity(item.id, 1)}
                onDecrement={() => updateQuantity(item.id, -1)}
              />
            ))
          ) : (
            <View style={styles.emptyCart}>
              <TextLine style={theme.typography.headline}>Your cart is empty</TextLine>
              <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
                Add a few dishes from the menu to continue.
              </TextLine>
            </View>
          )}
        </Surface>

        <Surface style={styles.summaryCard}>
          <TextLine style={theme.typography.title}>Summary</TextLine>

          <View style={styles.summaryRow}>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              Subtotal
            </TextLine>
            <TextLine style={theme.typography.bodyStrong}>{formatAll(subtotalAll)}</TextLine>
          </View>

          <View style={styles.summaryRow}>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              Delivery fee
            </TextLine>
            <TextLine style={theme.typography.bodyStrong}>{formatAll(deliveryFeeAll)}</TextLine>
          </View>

          <View
            style={[
              styles.totalRow,
              {
                borderTopColor: theme.colors.border.subtle
              }
            ]}
          >
            <TextLine style={theme.typography.headline}>Total</TextLine>
            <TextLine style={theme.typography.title}>{formatAll(totalAll)}</TextLine>
          </View>
        </Surface>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface.base,
            borderTopColor: theme.colors.border.subtle
          },
          theme.shadows.sheet
        ]}
      >
        <View style={styles.footerTotals}>
          <View>
            <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
              Total
            </TextLine>
            <TextLine style={theme.typography.title}>{formatAll(totalAll)}</TextLine>
          </View>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            {totalItems} items
          </TextLine>
        </View>

        <PrimaryButton
          onPress={cartItemsData.length > 0 ? onPlaceOrder : undefined}
          style={placeOrderButtonStyle}
        >
          Place order
        </PrimaryButton>
      </View>
    </View>
  );
};

const buildDefaultCart = (pageData: ReturnType<typeof getRestaurantPageData>) => {
  if (!pageData) {
    return [];
  }

  const flatItems = pageData.sections.flatMap((section) => section.items);

  return flatItems.slice(0, 2).map((item, index) => ({
    itemId: item.id,
    quantity: index === 0 ? 2 : 1
  }));
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 180,
    gap: 18
  },
  header: {
    gap: 6
  },
  itemCard: {
    paddingHorizontal: 18,
    paddingVertical: 18
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 6
  },
  emptyCart: {
    gap: 4,
    paddingVertical: 24
  },
  summaryCard: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 14
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14
  },
  footerTotals: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  placeOrderButton: {
    minHeight: 56
  },
  placeOrderButtonDisabled: {
    opacity: 0.45
  }
});
