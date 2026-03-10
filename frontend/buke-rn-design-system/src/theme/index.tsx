import React, { PropsWithChildren, createContext, useContext, useMemo } from "react";

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing, radii } from "./spacing";
import { shadows } from "./shadows";

export const bukeTheme = {
  colors,
  typography,
  spacing,
  radii,
  shadows
} as const;

export type BukeTheme = typeof bukeTheme;

const BukeThemeContext = createContext<BukeTheme>(bukeTheme);

export interface BukeThemeProviderProps {
  value?: Partial<BukeTheme>;
}

export const BukeThemeProvider = ({
  value,
  children
}: PropsWithChildren<BukeThemeProviderProps>) => {
  const mergedTheme = useMemo<BukeTheme>(
    () => ({
      ...bukeTheme,
      ...value
    }),
    [value]
  );

  return (
    <BukeThemeContext.Provider value={mergedTheme}>
      {children}
    </BukeThemeContext.Provider>
  );
};

export const useBukeTheme = () => useContext(BukeThemeContext);

export * from "./colors";
export * from "./typography";
export * from "./spacing";
export * from "./shadows";
