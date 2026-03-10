export const colors = {
  brand: {
    primary: "#06C167",
    primaryPressed: "#04A657",
    primaryMuted: "#D9F7E6",
    accent: "#101010"
  },
  surface: {
    canvas: "#F7F6F2",
    base: "#FFFFFF",
    raised: "#FFFFFF",
    sunken: "#F1F0EA",
    inverse: "#101010"
  },
  text: {
    primary: "#111111",
    secondary: "#60605A",
    tertiary: "#84847D",
    inverse: "#FFFFFF",
    success: "#0B8A48",
    danger: "#C43C2E"
  },
  border: {
    subtle: "#ECEBE4",
    strong: "#D9D7CE",
    inverse: "rgba(255,255,255,0.18)"
  },
  status: {
    created: "#B3B3AB",
    restaurantAccepted: "#06C167",
    driverAssigned: "#00A779",
    driverArriving: "#159CFF",
    pickedUp: "#101010",
    delivered: "#06C167",
    cancelled: "#D6453D"
  },
  rating: {
    badge: "#111111",
    badgeText: "#FFFFFF"
  },
  overlay: {
    soft: "rgba(17,17,17,0.06)",
    medium: "rgba(17,17,17,0.12)",
    strong: "rgba(17,17,17,0.18)"
  }
} as const;

export type BukeColors = typeof colors;
