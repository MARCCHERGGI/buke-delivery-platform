import React from "react";
import { StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { TextLine } from "./shared";

export interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
}

export const RatingBadge = ({ rating, reviewCount }: RatingBadgeProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.rating.badge,
          borderRadius: theme.radii.pill
        }
      ]}
    >
      <TextLine
        style={[
          theme.typography.caption,
          {
            color: theme.colors.rating.badgeText
          }
        ]}
      >
        {rating.toFixed(1)}
      </TextLine>
      {reviewCount ? (
        <>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: theme.colors.border.inverse
              }
            ]}
          />
          <TextLine
            style={[
              theme.typography.caption,
              {
                color: theme.colors.rating.badgeText
              }
            ]}
          >
            {reviewCount}
          </TextLine>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    marginHorizontal: 6
  }
});
