import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DriverCard, OrderStep, OrderTimeline } from "../components";
import { Surface, TextLine } from "../components/shared";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";
import { formatEta } from "../utils/format";

type TrackingPhase =
  | "restaurant_accepted"
  | "driver_arriving"
  | "picked_up"
  | "near_you"
  | "delivered";

interface TrackingPoint {
  id: string;
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
  etaMinutes: number;
  phase: TrackingPhase;
  statusLabel: string;
}

interface TrackingState {
  routeIndex: number;
  lastUpdatedAt: Date;
}

export interface BukeOrderTrackingScreenProps {
  restaurantId?: string;
  customerLabel?: string;
}

const trackingRoute: TrackingPoint[] = [
  {
    id: "driver-near-center",
    latitude: 40.9027,
    longitude: 20.6559,
    mapX: 18,
    mapY: 70,
    etaMinutes: 18,
    phase: "restaurant_accepted",
    statusLabel: "Courier heading to the restaurant"
  },
  {
    id: "driver-arriving",
    latitude: 40.9021,
    longitude: 20.6572,
    mapX: 28,
    mapY: 58,
    etaMinutes: 15,
    phase: "driver_arriving",
    statusLabel: "Courier arriving for pickup"
  },
  {
    id: "picked-up",
    latitude: 40.9018,
    longitude: 20.6594,
    mapX: 42,
    mapY: 50,
    etaMinutes: 11,
    phase: "picked_up",
    statusLabel: "Order picked up"
  },
  {
    id: "lakeside-route",
    latitude: 40.9014,
    longitude: 20.6624,
    mapX: 58,
    mapY: 42,
    etaMinutes: 7,
    phase: "near_you",
    statusLabel: "Courier is on the way"
  },
  {
    id: "near-customer",
    latitude: 40.9009,
    longitude: 20.6648,
    mapX: 73,
    mapY: 36,
    etaMinutes: 3,
    phase: "near_you",
    statusLabel: "Courier is a few minutes away"
  },
  {
    id: "delivered",
    latitude: 40.9003,
    longitude: 20.6666,
    mapX: 86,
    mapY: 28,
    etaMinutes: 0,
    phase: "delivered",
    statusLabel: "Delivered at the door"
  }
];

export const BukeOrderTrackingScreen = ({
  restaurantId = "casa-di-pizza",
  customerLabel = "Home"
}: BukeOrderTrackingScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);
  const [trackingState, setTrackingState] = useState<TrackingState>({
    routeIndex: 0,
    lastUpdatedAt: new Date()
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrackingState((current) => {
        if (current.routeIndex >= trackingRoute.length - 1) {
          return current;
        }

        return {
          routeIndex: current.routeIndex + 1,
          lastUpdatedAt: new Date()
        };
      });
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
        <TextLine style={theme.typography.title}>Tracking unavailable</TextLine>
      </View>
    );
  }

  const currentPoint = trackingRoute[trackingState.routeIndex];
  const orderSteps = buildOrderSteps(restaurant.name, currentPoint.phase, currentPoint.etaMinutes);
  const lastUpdatedLabel = currentPoint.phase === "delivered" ? "Just now" : "5 sec ago";

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
        <LiveMapCard
          restaurantName={restaurant.name}
          customerLabel={customerLabel}
          points={trackingRoute}
          currentIndex={trackingState.routeIndex}
        />

        <Surface style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryCopy}>
              <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
                Live order
              </TextLine>
              <TextLine style={theme.typography.title}>
                {currentPoint.phase === "delivered"
                  ? "Order delivered"
                  : `Arriving in ${formatEta(currentPoint.etaMinutes)}`}
              </TextLine>
              <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
                {currentPoint.statusLabel}
              </TextLine>
            </View>

            <View
              style={[
                styles.etaBadge,
                {
                  backgroundColor: theme.colors.brand.primaryMuted,
                  borderRadius: theme.radii.lg
                }
              ]}
            >
              <TextLine style={theme.typography.micro}>ETA</TextLine>
              <TextLine style={theme.typography.headline}>
                {currentPoint.phase === "delivered" ? "0 min" : formatEta(currentPoint.etaMinutes)}
              </TextLine>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.metaChip,
                {
                  backgroundColor: theme.colors.surface.sunken,
                  borderRadius: theme.radii.pill
                }
              ]}
            >
              <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
                Driver location
              </TextLine>
              <TextLine style={theme.typography.label}>
                {currentPoint.latitude.toFixed(4)}, {currentPoint.longitude.toFixed(4)}
              </TextLine>
            </View>

            <View
              style={[
                styles.metaChip,
                {
                  backgroundColor: theme.colors.surface.sunken,
                  borderRadius: theme.radii.pill
                }
              ]}
            >
              <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
                Updated
              </TextLine>
              <TextLine style={theme.typography.label}>{lastUpdatedLabel}</TextLine>
            </View>
          </View>
        </Surface>

        <DriverCard
          name="Ardit Hoxha"
          vehicleLabel="Black scooter · AB 412 XY"
          rating={4.9}
          completedTrips={624}
          arrivalLabel={
            currentPoint.phase === "delivered"
              ? "Completed"
              : `${formatEta(currentPoint.etaMinutes)} away`
          }
        />

        <Surface style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <TextLine style={theme.typography.title}>Order timeline</TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              Live progress updates every 5 seconds
            </TextLine>
          </View>
          <OrderTimeline steps={orderSteps} />
        </Surface>
      </ScrollView>
    </View>
  );
};

interface LiveMapCardProps {
  restaurantName: string;
  customerLabel: string;
  points: TrackingPoint[];
  currentIndex: number;
}

const LiveMapCard = ({
  restaurantName,
  customerLabel,
  points,
  currentIndex
}: LiveMapCardProps) => {
  const theme = useBukeTheme();
  const driverPoint = points[currentIndex];
  const startPoint = points[1];
  const endPoint = points[points.length - 1];
  const breadcrumbs = buildBreadcrumbs(points);

  return (
    <View
      style={[
        styles.mapCard,
        {
          backgroundColor: theme.colors.surface.base,
          borderBottomLeftRadius: theme.radii.xl,
          borderBottomRightRadius: theme.radii.xl
        }
      ]}
    >
      <View style={styles.mapHeader}>
        <View
          style={[
            styles.mapHeaderBadge,
            {
              backgroundColor: theme.colors.brand.primaryMuted,
              borderRadius: theme.radii.pill
            }
          ]}
        >
          <TextLine style={theme.typography.micro}>Live map</TextLine>
        </View>
        <TextLine style={theme.typography.display}>Track your order</TextLine>
        <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
          Follow the courier from pickup to dropoff in real time.
        </TextLine>
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
        <View
          style={[
            styles.lakeShape,
            {
              backgroundColor: "#D8EEFF"
            }
          ]}
        />
        <View
          style={[
            styles.roadHorizontal,
            {
              backgroundColor: theme.colors.surface.base
            }
          ]}
        />
        <View
          style={[
            styles.roadVertical,
            {
              backgroundColor: theme.colors.surface.base
            }
          ]}
        />
        <View
          style={[
            styles.roadDiagonal,
            {
              backgroundColor: theme.colors.surface.base
            }
          ]}
        />

        {breadcrumbs.map((dot, index) => (
          <View
            key={dot.id}
            style={[
              styles.routeDot,
              toMapPosition(dot.mapX, dot.mapY),
              {
                backgroundColor:
                  index <= currentIndex * 5
                    ? theme.colors.brand.primary
                    : theme.colors.border.strong
              }
            ]}
          />
        ))}

        <MapPin
          x={startPoint.mapX}
          y={startPoint.mapY}
          label={restaurantName}
          tone="dark"
        />
        <MapPin x={endPoint.mapX} y={endPoint.mapY} label={customerLabel} tone="light" />

        <View
          style={[
            styles.driverPulse,
            toMapPosition(driverPoint.mapX, driverPoint.mapY),
            {
              backgroundColor: theme.colors.overlay.medium
            }
          ]}
        />
        <View
          style={[
            styles.driverMarker,
            toMapPosition(driverPoint.mapX, driverPoint.mapY),
            {
              backgroundColor: theme.colors.brand.primary,
              borderColor: theme.colors.surface.base
            },
            theme.shadows.floating
          ]}
        />
      </View>
    </View>
  );
};

interface MapPinProps {
  x: number;
  y: number;
  label: string;
  tone: "dark" | "light";
}

const MapPin = ({ x, y, label, tone }: MapPinProps) => {
  const theme = useBukeTheme();
  const isDark = tone === "dark";

  return (
    <View style={[styles.pinWrap, toMapPosition(x, y)]}>
      <View
        style={[
          styles.pinMarker,
          {
            backgroundColor: isDark ? theme.colors.surface.inverse : theme.colors.surface.base,
            borderColor: isDark ? theme.colors.surface.inverse : theme.colors.border.strong
          }
        ]}
      />
      <View
        style={[
          styles.pinLabel,
          {
            backgroundColor: isDark ? theme.colors.surface.inverse : theme.colors.surface.base,
            borderColor: isDark ? theme.colors.border.inverse : theme.colors.border.subtle,
            borderRadius: theme.radii.pill
          },
          theme.shadows.card
        ]}
      >
        <TextLine
          style={theme.typography.caption}
          color={isDark ? theme.colors.text.inverse : theme.colors.text.primary}
        >
          {label}
        </TextLine>
      </View>
    </View>
  );
};

const buildOrderSteps = (
  restaurantName: string,
  currentPhase: TrackingPhase,
  etaMinutes: number
): OrderStep[] => {
  const phaseRank = getPhaseRank(currentPhase);

  return [
    {
      id: "accepted",
      title: "Restaurant confirmed",
      detail: `${restaurantName} accepted the order`,
      state: getStepState(phaseRank, 0)
    },
    {
      id: "driver-arriving",
      title: "Courier arriving",
      detail: "Heading to pickup now",
      state: getStepState(phaseRank, 1)
    },
    {
      id: "picked-up",
      title: "Picked up",
      detail: "Order is packed and leaving the restaurant",
      state: getStepState(phaseRank, 2)
    },
    {
      id: "near-you",
      title: "Near you",
      detail: currentPhase === "delivered" ? "Courier reached the destination" : `${formatEta(etaMinutes)} remaining`,
      state: getStepState(phaseRank, 3)
    },
    {
      id: "delivered",
      title: "Delivered",
      detail: currentPhase === "delivered" ? "Enjoy your meal" : "Final handoff pending",
      state: getStepState(phaseRank, 4)
    }
  ];
};

const getPhaseRank = (phase: TrackingPhase) => {
  switch (phase) {
    case "restaurant_accepted":
      return 0;
    case "driver_arriving":
      return 1;
    case "picked_up":
      return 2;
    case "near_you":
      return 3;
    case "delivered":
      return 4;
    default:
      return 0;
  }
};

const getStepState = (
  currentRank: number,
  stepRank: number
): OrderStep["state"] => {
  if (currentRank > stepRank) {
    return "completed";
  }

  if (currentRank === stepRank) {
    return "current";
  }

  return "upcoming";
};

const buildBreadcrumbs = (points: TrackingPoint[]) =>
  points.flatMap((point, index) => {
    const nextPoint = points[index + 1];

    if (!nextPoint) {
      return [];
    }

    return Array.from({ length: 5 }, (_, stepIndex) => ({
      id: `${point.id}-${nextPoint.id}-${stepIndex}`,
      mapX: point.mapX + ((nextPoint.mapX - point.mapX) * stepIndex) / 5,
      mapY: point.mapY + ((nextPoint.mapY - point.mapY) * stepIndex) / 5
    }));
  });

const toMapPosition = (mapX: number, mapY: number) => ({
  left: `${mapX}%`,
  top: `${mapY}%`
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
  mapCard: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
    gap: 16
  },
  mapHeader: {
    gap: 8
  },
  mapHeaderBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  mapCanvas: {
    height: 330,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative"
  },
  lakeShape: {
    position: "absolute",
    right: -26,
    top: 0,
    bottom: 0,
    width: 122,
    borderTopLeftRadius: 72,
    borderBottomLeftRadius: 72
  },
  roadHorizontal: {
    position: "absolute",
    left: "10%",
    right: "20%",
    top: "62%",
    height: 18,
    borderRadius: 999
  },
  roadVertical: {
    position: "absolute",
    top: "18%",
    bottom: "16%",
    left: "44%",
    width: 18,
    borderRadius: 999
  },
  roadDiagonal: {
    position: "absolute",
    left: "18%",
    top: "28%",
    width: "58%",
    height: 18,
    borderRadius: 999,
    transform: [{ rotate: "-24deg" }]
  },
  routeDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 999,
    marginLeft: -3,
    marginTop: -3
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
  pinWrap: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -10,
    marginTop: -10
  },
  pinMarker: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2
  },
  pinLabel: {
    marginTop: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: 140
  },
  summaryCard: {
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  summaryCopy: {
    flex: 1,
    gap: 4
  },
  etaBadge: {
    minWidth: 90,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  metaRow: {
    flexDirection: "row",
    gap: 10
  },
  metaChip: {
    flex: 1,
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  timelineCard: {
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16
  },
  timelineHeader: {
    gap: 4
  }
});
