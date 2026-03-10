import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { formatAll } from "../utils/format";
import { PlusGlyph, TextLine } from "./shared";

export interface MenuItemCardProps {
  name: string;
  description?: string;
  priceAll: number;
  imageUri?: string;
  tagLabel?: string;
  onAdd?: () => void;
}

export const MenuItemCard = ({
  name,
  description,
  priceAll,
  imageUri,
  tagLabel,
  onAdd
}: MenuItemCardProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.border.subtle
        }
      ]}
    >
      <View style={styles.textBlock}>
        {tagLabel ? (
          <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
            {tagLabel}
          </TextLine>
        ) : null}
        <TextLine style={theme.typography.headline}>{name}</TextLine>
        {description ? (
          <TextLine
            style={theme.typography.body}
            color={theme.colors.text.secondary}
            numberOfLines={2}
          >
            {description}
          </TextLine>
        ) : null}
        <TextLine style={theme.typography.bodyStrong}>{formatAll(priceAll)}</TextLine>
      </View>
      <View style={styles.mediaBlock}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.image,
              {
                backgroundColor: theme.colors.surface.sunken
              }
            ]}
          />
        )}
        <Pressable
          onPress={onAdd}
          style={[
            styles.addButton,
            {
              backgroundColor: theme.colors.brand.accent,
              borderRadius: theme.radii.pill
            },
            theme.shadows.card
          ]}
        >
          <PlusGlyph />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1
  },
  textBlock: {
    flex: 1,
    gap: 6
  },
  mediaBlock: {
    width: 108,
    alignItems: "flex-end"
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 18
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
    bottom: -10
  }
});
