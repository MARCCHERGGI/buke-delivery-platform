import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { formatAll } from "../utils/format";
import { TextLine } from "./shared";

export interface CartItemRowProps {
  name: string;
  sectionLabel?: string;
  unitPriceAll: number;
  quantity: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export const CartItemRow = ({
  name,
  sectionLabel,
  unitPriceAll,
  quantity,
  onIncrement,
  onDecrement
}: CartItemRowProps) => {
  const theme = useBukeTheme();
  const lineTotalAll = unitPriceAll * quantity;

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.border.subtle
        }
      ]}
    >
      <View style={styles.copyBlock}>
        {sectionLabel ? (
          <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
            {sectionLabel}
          </TextLine>
        ) : null}
        <TextLine style={theme.typography.headline}>{name}</TextLine>
        <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
          {formatAll(unitPriceAll)} each
        </TextLine>
      </View>

      <View style={styles.metaBlock}>
        <TextLine style={theme.typography.bodyStrong}>{formatAll(lineTotalAll)}</TextLine>
        <View
          style={[
            styles.stepper,
            {
              backgroundColor: theme.colors.surface.sunken,
              borderRadius: theme.radii.pill
            }
          ]}
        >
          <StepperButton
            label="-"
            onPress={onDecrement}
            borderColor={theme.colors.border.strong}
            textColor={theme.colors.text.primary}
          />
          <TextLine style={theme.typography.label}>{quantity}</TextLine>
          <StepperButton
            label="+"
            onPress={onIncrement}
            borderColor={theme.colors.border.strong}
            textColor={theme.colors.text.primary}
          />
        </View>
      </View>
    </View>
  );
};

interface StepperButtonProps {
  label: string;
  onPress?: () => void;
  borderColor: string;
  textColor: string;
}

const StepperButton = ({ label, onPress, borderColor, textColor }: StepperButtonProps) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.stepperButton,
      {
        borderColor
      }
    ]}
  >
    <TextLine style={styles.stepperText} color={textColor}>
      {label}
    </TextLine>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1
  },
  copyBlock: {
    flex: 1,
    gap: 4
  },
  metaBlock: {
    minWidth: 112,
    alignItems: "flex-end",
    gap: 10
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  stepperButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  stepperText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: "700"
  }
});
