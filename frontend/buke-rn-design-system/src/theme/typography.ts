import { TextStyle } from "react-native";

const fontFamilies = {
  display: "Satoshi-Bold",
  heading: "Satoshi-Bold",
  body: "Satoshi-Medium",
  bodyRegular: "Satoshi-Regular"
} as const;

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
    fontWeight: "700"
  },
  titleLarge: {
    fontFamily: fontFamilies.heading,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontWeight: "700"
  },
  title: {
    fontFamily: fontFamilies.heading,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.3,
    fontWeight: "700"
  },
  headline: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontWeight: "700"
  },
  body: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
    fontWeight: "400"
  },
  bodyStrong: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.1,
    fontWeight: "600"
  },
  label: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: "600"
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontWeight: "500"
  },
  micro: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
    fontWeight: "500",
    textTransform: "uppercase"
  }
};

export type BukeTypography = typeof typography;
