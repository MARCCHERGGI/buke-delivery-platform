import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { useBukeTheme } from "../theme";
import { TextLine } from "./shared";

export interface CategoryItem {
  id: string;
  label: string;
}

export interface CategoryScrollerProps {
  categories: CategoryItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export const CategoryScroller = ({
  categories,
  selectedId,
  onSelect
}: CategoryScrollerProps) => {
  const theme = useBukeTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => {
        const selected = category.id === selectedId;

        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect?.(category.id)}
            style={[
              styles.chip,
              {
                backgroundColor: selected
                  ? theme.colors.brand.accent
                  : theme.colors.surface.base,
                borderColor: selected
                  ? theme.colors.brand.accent
                  : theme.colors.border.subtle,
                borderRadius: theme.radii.pill
              }
            ]}
          >
            <TextLine
              style={theme.typography.label}
              color={selected ? theme.colors.text.inverse : theme.colors.text.primary}
            >
              {category.label}
            </TextLine>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    gap: 10
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 11
  }
});
