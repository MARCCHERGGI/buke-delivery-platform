import React from "react";
import { StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { formatAll } from "../utils/format";
import { PrimaryButton, TextLine } from "./shared";

export interface CartPanelProps {
  itemCount: number;
  subtotalAll: number;
  deliveryFeeAll: number;
  serviceFeeAll?: number;
  discountAll?: number;
  etaLabel: string;
  ctaLabel?: string;
  onCheckout?: () => void;
}

export const CartPanel = ({
  itemCount,
  subtotalAll,
  deliveryFeeAll,
  serviceFeeAll = 0,
  discountAll = 0,
  etaLabel,
  ctaLabel = "Go to checkout",
  onCheckout
}: CartPanelProps) => {
  const theme = useBukeTheme();
  const totalAll = subtotalAll + deliveryFeeAll + serviceFeeAll - discountAll;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.base,
          borderTopColor: theme.colors.border.subtle,
          borderTopLeftRadius: theme.radii.xl,
          borderTopRightRadius: theme.radii.xl
        },
        theme.shadows.sheet
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <TextLine style={theme.typography.headline}>{itemCount} items</TextLine>
          <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
            Arriving {etaLabel}
          </TextLine>
        </View>
        <TextLine style={theme.typography.title}>{formatAll(totalAll)}</TextLine>
      </View>
      <View style={styles.breakdownRow}>
        <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
          Subtotal
        </TextLine>
        <TextLine style={theme.typography.bodyStrong}>{formatAll(subtotalAll)}</TextLine>
      </View>
      <View style={styles.breakdownRow}>
        <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
          Delivery
        </TextLine>
        <TextLine style={theme.typography.bodyStrong}>{formatAll(deliveryFeeAll)}</TextLine>
      </View>
      {serviceFeeAll > 0 ? (
        <View style={styles.breakdownRow}>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Service fee
          </TextLine>
          <TextLine style={theme.typography.bodyStrong}>{formatAll(serviceFeeAll)}</TextLine>
        </View>
      ) : null}
      {discountAll > 0 ? (
        <View style={styles.breakdownRow}>
          <TextLine style={theme.typography.body} color={theme.colors.text.success}>
            Discount
          </TextLine>
          <TextLine style={theme.typography.bodyStrong} color={theme.colors.text.success}>
            -{formatAll(discountAll)}
          </TextLine>
        </View>
      ) : null}
      <PrimaryButton onPress={onCheckout} style={styles.button}>
        {ctaLabel}
      </PrimaryButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 12
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  button: {
    marginTop: 4
  }
});
