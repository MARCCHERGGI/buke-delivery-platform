import React from "react";

import { BukeThemeProvider } from "../theme";
import { BukeHomeScreen } from "../screens/BukeHomeScreen";

export const BukeHomePreview = () => {
  return (
    <BukeThemeProvider>
      <BukeHomeScreen />
    </BukeThemeProvider>
  );
};
