import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { useBukeTheme } from "../theme";
import { SearchGlyph } from "./shared";

export interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search dishes, restaurants, cuisines"
}: SearchBarProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.base,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radii.xl
        }
      ]}
    >
      <SearchGlyph />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.tertiary}
        style={[
          styles.input,
          theme.typography.body,
          {
            color: theme.colors.text.primary
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 12
  },
  input: {
    flex: 1,
    paddingVertical: 0
  }
});
