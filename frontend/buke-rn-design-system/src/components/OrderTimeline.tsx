import React from "react";
import { StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { TextLine } from "./shared";

export type OrderStepState = "upcoming" | "current" | "completed";

export interface OrderStep {
  id: string;
  title: string;
  detail: string;
  state: OrderStepState;
}

export interface OrderTimelineProps {
  steps: OrderStep[];
}

export const OrderTimeline = ({ steps }: OrderTimelineProps) => {
  const theme = useBukeTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = step.state === "completed";
        const isCurrent = step.state === "current";
        const markerColor =
          isCompleted || isCurrent
            ? theme.colors.brand.primary
            : theme.colors.border.strong;

        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: markerColor,
                    borderColor: markerColor
                  }
                ]}
              />
              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: isCompleted
                        ? theme.colors.brand.primary
                        : theme.colors.border.subtle
                    }
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.textBlock}>
              <TextLine
                style={theme.typography.label}
                color={isCurrent ? theme.colors.text.primary : theme.colors.text.secondary}
              >
                {step.title}
              </TextLine>
              <TextLine style={theme.typography.caption} color={theme.colors.text.tertiary}>
                {step.detail}
              </TextLine>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  rail: {
    alignItems: "center",
    width: 20
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 22
  },
  textBlock: {
    flex: 1,
    gap: 2
  }
});
