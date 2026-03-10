import React, { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import { useBukeTheme } from "../theme";

export interface SurfaceProps extends PropsWithChildren {
  style?: ViewStyle | ViewStyle[];
}

export const Surface = ({ children, style }: SurfaceProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        sharedStyles.surface,
        {
          backgroundColor: theme.colors.surface.base,
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radii.lg
        },
        theme.shadows.card,
        style
      ]}
    >
      {children}
    </View>
  );
};

export interface TextLineProps extends PropsWithChildren {
  style?: TextStyle | TextStyle[];
  color?: string;
  numberOfLines?: number;
}

export const TextLine = ({
  children,
  style,
  color,
  numberOfLines
}: TextLineProps) => {
  const theme = useBukeTheme();

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color: color ?? theme.colors.text.primary }, style]}
    >
      {children}
    </Text>
  );
};

export interface PrimaryButtonProps extends PropsWithChildren {
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export const PrimaryButton = ({
  children,
  onPress,
  style
}: PrimaryButtonProps) => {
  const theme = useBukeTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        sharedStyles.primaryButton,
        {
          backgroundColor: pressed
            ? theme.colors.brand.primaryPressed
            : theme.colors.brand.primary,
          borderRadius: theme.radii.pill
        },
        style
      ]}
    >
      <Text
        style={[
          theme.typography.label,
          {
            color: theme.colors.text.inverse
          }
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

export interface SecondaryButtonProps extends PropsWithChildren {
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}

export const SecondaryButton = ({
  children,
  onPress,
  style
}: SecondaryButtonProps) => {
  const theme = useBukeTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        sharedStyles.secondaryButton,
        {
          backgroundColor: pressed ? theme.colors.surface.sunken : theme.colors.surface.base,
          borderColor: theme.colors.border.strong,
          borderRadius: theme.radii.pill
        },
        style
      ]}
    >
      <Text
        style={[
          theme.typography.label,
          {
            color: theme.colors.text.primary
          }
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
};

export const SearchGlyph = () => {
  const theme = useBukeTheme();

  return (
    <View style={sharedStyles.searchGlyphWrap}>
      <View
        style={[
          sharedStyles.searchGlyphCircle,
          {
            borderColor: theme.colors.text.secondary
          }
        ]}
      />
      <View
        style={[
          sharedStyles.searchGlyphHandle,
          {
            backgroundColor: theme.colors.text.secondary
          }
        ]}
      />
    </View>
  );
};

export const PlusGlyph = () => {
  const theme = useBukeTheme();

  return (
    <View style={sharedStyles.plusGlyphWrap}>
      <View
        style={[
          sharedStyles.plusGlyphHorizontal,
          {
            backgroundColor: theme.colors.text.inverse
          }
        ]}
      />
      <View
        style={[
          sharedStyles.plusGlyphVertical,
          {
            backgroundColor: theme.colors.text.inverse
          }
        ]}
      />
    </View>
  );
};

const sharedStyles = StyleSheet.create({
  surface: {
    borderWidth: 1,
    overflow: "hidden"
  },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 1
  },
  searchGlyphWrap: {
    width: 18,
    height: 18,
    position: "relative"
  },
  searchGlyphCircle: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderRadius: 999,
    position: "absolute",
    top: 0,
    left: 0
  },
  searchGlyphHandle: {
    width: 7,
    height: 2,
    position: "absolute",
    right: 0,
    bottom: 1,
    transform: [{ rotate: "45deg" }]
  },
  plusGlyphWrap: {
    width: 16,
    height: 16,
    position: "relative"
  },
  plusGlyphHorizontal: {
    width: 16,
    height: 2,
    position: "absolute",
    top: 7
  },
  plusGlyphVertical: {
    width: 2,
    height: 16,
    position: "absolute",
    left: 7
  }
});
