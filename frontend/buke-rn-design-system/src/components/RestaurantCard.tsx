import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { formatEta } from "../utils/format";
import { RatingBadge } from "./RatingBadge";
import { Surface, TextLine } from "./shared";

export interface RestaurantCardProps {
  name: string;
  cuisine: string;
  etaMinutes: number;
  feeLabel: string;
  rating: number;
  reviewCount?: number;
  imageUri?: string;
  priceRange?: string;
  distanceLabel?: string;
  onPress?: () => void;
}

export const RestaurantCard = ({
  name,
  cuisine,
  etaMinutes,
  feeLabel,
  rating,
  reviewCount,
  imageUri,
  priceRange,
  distanceLabel,
  onPress
}: RestaurantCardProps) => {
  const theme = useBukeTheme();
  const subtitle = [cuisine, priceRange, distanceLabel].filter(Boolean).join("  ");

  return (
    <Pressable onPress={onPress}>
      <Surface>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.hero} />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              {
                backgroundColor: theme.colors.brand.primaryMuted
              }
            ]}
          />
        )}
        <View style={styles.ratingWrap}>
          <RatingBadge rating={rating} reviewCount={reviewCount} />
        </View>
        <View style={styles.content}>
          <TextLine style={theme.typography.headline} numberOfLines={1}>
            {name}
          </TextLine>
          <TextLine
            style={theme.typography.body}
            color={theme.colors.text.secondary}
            numberOfLines={1}
          >
            {subtitle}
          </TextLine>
          <View style={styles.metaRow}>
            <TextLine style={theme.typography.label}>{formatEta(etaMinutes)}</TextLine>
            <View
              style={[
                styles.separator,
                {
                  backgroundColor: theme.colors.border.strong
                }
              ]}
            />
            <TextLine style={theme.typography.label} color={theme.colors.text.secondary}>
              {feeLabel}
            </TextLine>
          </View>
        </View>
      </Surface>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: 164
  },
  heroPlaceholder: {
    width: "100%",
    height: 164
  },
  ratingWrap: {
    position: "absolute",
    right: 12,
    top: 12
  },
  content: {
    padding: 16,
    gap: 6
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 999
  }
});
