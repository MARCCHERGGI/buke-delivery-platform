import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PrimaryButton, SecondaryButton, Surface, TextLine } from "../components/shared";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";
import { formatEta } from "../utils/format";

export interface BukeDriverNavigationScreenProps {
  restaurantId?: string;
  stage?: "pickup" | "dropoff";
  onPrimaryAction?: () => void;
}

export const BukeDriverNavigationScreen = ({
  restaurantId = "casa-di-pizza",
  stage = "pickup",
  onPrimaryAction
}: BukeDriverNavigationScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);

  if (!restaurant) {
    return (
      <View
        style={[
          styles.emptyScreen,
          {
            backgroundColor: theme.colors.surface.canvas
          }
        ]}
      >
        <TextLine style={theme.typography.title}>Navigation unavailable</TextLine>
      </View>
    );
  }

  const isPickupStage = stage === "pickup";
  const driverPoint = isPickupStage ? { x: 26, y: 74 } : { x: 56, y: 46 };
  const etaMinutes = isPickupStage ? 4 : 8;
  const distanceKm = isPickupStage ? restaurant.distanceKm : restaurant.distanceKm + 1.1;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.colors.surface.canvas
        }
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.mapHero,
            {
              backgroundColor: theme.colors.surface.base,
              borderBottomLeftRadius: theme.radii.xl,
              borderBottomRightRadius: theme.radii.xl
            }
          ]}
        >
          <View style={styles.heroHeader}>
            <View>
              <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
                Navigation
              </TextLine>
              <TextLine style={theme.typography.display}>
                {isPickupStage ? "Drive to pickup" : "Drive to customer"}
              </TextLine>
            </View>
            <View
              style={[
                styles.heroStat,
                {
                  backgroundColor: theme.colors.brand.primaryMuted,
                  borderRadius: theme.radii.lg
                }
              ]}
            >
              <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
                ETA
              </TextLine>
              <TextLine style={theme.typography.headline}>{formatEta(etaMinutes)}</TextLine>
            </View>
          </View>

          <View
            style={[
              styles.mapCanvas,
              {
                backgroundColor: theme.colors.surface.sunken,
                borderColor: theme.colors.border.subtle,
                borderRadius: theme.radii.xl
              }
            ]}
          >
            <View style={[styles.lakeShape, { backgroundColor: "#D8EEFF" }]} />
            <View
              style={[
                styles.routeBar,
                styles.routeHorizontal,
                { backgroundColor: theme.colors.surface.base }
              ]}
            />
            <View
              style={[
                styles.routeBar,
                styles.routeVertical,
                { backgroundColor: theme.colors.surface.base }
              ]}
            />
            <View
              style={[
                styles.routeBar,
                styles.routeDiagonal,
                { backgroundColor: theme.colors.surface.base }
              ]}
            />

            {routeDots.map((dot) => (
              <View
                key={dot.id}
                style={[
                  styles.routeDot,
                  toMapPosition(dot.x, dot.y),
                  {
                    backgroundColor:
                      dot.rank <= (isPickupStage ? 5 : 10)
                        ? theme.colors.brand.primary
                        : theme.colors.border.strong
                  }
                ]}
              />
            ))}

            <MapMarker
              x={34}
              y={58}
              label={restaurant.name}
              backgroundColor={theme.colors.surface.inverse}
              textColor={theme.colors.text.inverse}
            />
            <MapMarker
              x={80}
              y={30}
              label="Hotel Enkelana"
              backgroundColor={theme.colors.surface.base}
              textColor={theme.colors.text.primary}
              borderColor={theme.colors.border.subtle}
            />

            <View
              style={[
                styles.driverPulse,
                toMapPosition(driverPoint.x, driverPoint.y),
                { backgroundColor: theme.colors.overlay.medium }
              ]}
            />
            <View
              style={[
                styles.driverMarker,
                toMapPosition(driverPoint.x, driverPoint.y),
                {
                  backgroundColor: theme.colors.brand.primary,
                  borderColor: theme.colors.surface.base
                },
                theme.shadows.floating
              ]}
            />
          </View>
        </View>

        <Surface style={styles.routeSummary}>
          <View style={styles.routeSummaryRow}>
            <SummaryTile label="Distance" value={`${distanceKm.toFixed(1)} km`} />
            <SummaryTile label="Route" value={isPickupStage ? "To pickup" : "To customer"} />
            <SummaryTile label="Traffic" value="Light" />
          </View>
          <View style={styles.stopBlock}>
            <TextLine style={theme.typography.title}>
              {isPickupStage ? restaurant.name : "Hotel Enkelana, promenade entrance"}
            </TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              {isPickupStage
                ? "Order #BKE-2041 · 3 items waiting. Enter from the main side street."
                : "Customer note: blue gate, second building after the pharmacy."}
            </TextLine>
          </View>
          <View style={styles.actionRow}>
            <SecondaryButton style={styles.actionButton}>Call</SecondaryButton>
            <PrimaryButton onPress={onPrimaryAction} style={styles.actionButton}>
              {isPickupStage ? "Arrived at pickup" : "Arrived at customer"}
            </PrimaryButton>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
};

interface SummaryTileProps {
  label: string;
  value: string;
}

const SummaryTile = ({ label, value }: SummaryTileProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.summaryTile,
        {
          backgroundColor: theme.colors.surface.sunken,
          borderRadius: theme.radii.lg
        }
      ]}
    >
      <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
        {label}
      </TextLine>
      <TextLine style={theme.typography.label}>{value}</TextLine>
    </View>
  );
};

interface MapMarkerProps {
  x: number;
  y: number;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}

const MapMarker = ({
  x,
  y,
  label,
  backgroundColor,
  textColor,
  borderColor
}: MapMarkerProps) => {
  const theme = useBukeTheme();

  return (
    <View style={[styles.mapMarkerWrap, toMapPosition(x, y)]}>
      <View
        style={[
          styles.mapPin,
          {
            backgroundColor,
            borderColor: borderColor ?? backgroundColor
          }
        ]}
      />
      <View
        style={[
          styles.mapLabel,
          {
            backgroundColor,
            borderColor: borderColor ?? theme.colors.border.inverse,
            borderRadius: theme.radii.pill
          },
          theme.shadows.card
        ]}
      >
        <TextLine style={theme.typography.caption} color={textColor}>
          {label}
        </TextLine>
      </View>
    </View>
  );
};

const routeDots = [
  { id: "d1", x: 27, y: 73, rank: 0 },
  { id: "d2", x: 29, y: 68, rank: 1 },
  { id: "d3", x: 31, y: 63, rank: 2 },
  { id: "d4", x: 33, y: 59, rank: 3 },
  { id: "d5", x: 34, y: 58, rank: 4 },
  { id: "d6", x: 42, y: 54, rank: 5 },
  { id: "d7", x: 50, y: 49, rank: 6 },
  { id: "d8", x: 59, y: 44, rank: 7 },
  { id: "d9", x: 67, y: 39, rank: 8 },
  { id: "d10", x: 74, y: 34, rank: 9 },
  { id: "d11", x: 80, y: 30, rank: 10 }
];

const toMapPosition = (x: number, y: number) => ({
  left: `${x}%`,
  top: `${y}%`
});

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  content: {
    paddingBottom: 40,
    gap: 18
  },
  mapHero: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 16
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  heroStat: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "flex-end"
  },
  mapCanvas: {
    height: 360,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative"
  },
  lakeShape: {
    position: "absolute",
    right: -28,
    top: 0,
    bottom: 0,
    width: 128,
    borderTopLeftRadius: 72,
    borderBottomLeftRadius: 72
  },
  routeBar: {
    position: "absolute",
    borderRadius: 999
  },
  routeHorizontal: {
    left: "14%",
    right: "20%",
    top: "62%",
    height: 18
  },
  routeVertical: {
    top: "18%",
    bottom: "15%",
    left: "42%",
    width: 18
  },
  routeDiagonal: {
    left: "28%",
    top: "34%",
    width: "48%",
    height: 18,
    transform: [{ rotate: "-22deg" }]
  },
  routeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 999,
    marginLeft: -3,
    marginTop: -3
  },
  mapMarkerWrap: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -10,
    marginTop: -10
  },
  mapPin: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2
  },
  mapLabel: {
    marginTop: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  driverPulse: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 999,
    marginLeft: -14,
    marginTop: -14
  },
  driverMarker: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 3,
    marginLeft: -8,
    marginTop: -8
  },
  routeSummary: {
    marginHorizontal: 16,
    padding: 18,
    gap: 16
  },
  routeSummaryRow: {
    flexDirection: "row",
    gap: 10
  },
  summaryTile: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2
  },
  stopBlock: {
    gap: 4
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
  }
});
