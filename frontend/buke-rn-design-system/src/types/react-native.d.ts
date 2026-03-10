declare module "react-native" {
  import * as React from "react";

  export type StyleProp<T> = T | T[] | null | undefined;
  export type TextStyle = Record<string, unknown>;
  export type ViewStyle = Record<string, unknown>;
  export type ImageStyle = Record<string, unknown>;

  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const Pressable: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;

  export const Platform: {
    OS: "ios" | "android" | "web";
    select<T>(options: { ios?: T; android?: T; default?: T }): T;
  };

  export const StyleSheet: {
    create<T extends Record<string, unknown>>(styles: T): T;
    hairlineWidth: number;
  };
}
