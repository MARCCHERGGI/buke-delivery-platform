import { Platform, ViewStyle } from "react-native";

const iosShadow = (
  shadowColor: string,
  shadowOpacity: number,
  shadowRadius: number,
  shadowOffsetHeight: number
): ViewStyle => ({
  shadowColor,
  shadowOpacity,
  shadowRadius,
  shadowOffset: {
    width: 0,
    height: shadowOffsetHeight
  }
});

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: iosShadow("#101010", 0.08, 16, 8),
    android: {
      elevation: 4
    },
    default: {
      boxShadow: "0px 8px 16px rgba(16,16,16,0.08)"
    }
  }),
  floating: Platform.select<ViewStyle>({
    ios: iosShadow("#101010", 0.16, 22, 12),
    android: {
      elevation: 9
    },
    default: {
      boxShadow: "0px 12px 22px rgba(16,16,16,0.16)"
    }
  }),
  sheet: Platform.select<ViewStyle>({
    ios: iosShadow("#101010", 0.12, 28, -4),
    android: {
      elevation: 12
    },
    default: {
      boxShadow: "0px -4px 28px rgba(16,16,16,0.12)"
    }
  })
};

export type BukeShadows = typeof shadows;
