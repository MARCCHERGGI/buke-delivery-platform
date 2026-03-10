import React from "react";
import { StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { formatEta } from "../utils/format";
import { TextLine } from "./shared";

export interface DeliveryETAWidgetProps {
  etaMinutes: number;
  stateLabel: string;
  feeLabel: string;
}

export const DeliveryETAWidget = ({
  etaMinutes,
  stateLabel,
  feeLabel
}: DeliveryETAWidgetProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.base,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radii.xl
        },
        theme.shadows.card
      ]}
    >
      <View style={styles.left}>
        <TextLine style={theme.typography.micro} color={theme.colors.text.secondary}>
          Delivery
        </TextLine>
        <TextLine style={theme.typography.title}>{formatEta(etaMinutes)}</TextLine>
      </View>
      <View style={styles.right}>
        <TextLine style={theme.typography.label}>{stateLabel}</TextLine>
        <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
          {feeLabel}
        </TextLine>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    padding: 16
  },
  left: {
    gap: 2
  },
  right: {
    alignItems: "flex-end",
    gap: 4
  }
});
