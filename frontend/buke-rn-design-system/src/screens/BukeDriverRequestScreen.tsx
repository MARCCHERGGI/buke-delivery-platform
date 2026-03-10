import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SecondaryButton, PrimaryButton, Surface, TextLine } from "../components/shared";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";
import { formatAll, formatEta } from "../utils/format";

export interface BukeDriverRequestScreenProps {
  restaurantId?: string;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const BukeDriverRequestScreen = ({
  restaurantId = "casa-di-pizza",
  onAccept,
  onDecline
}: BukeDriverRequestScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);
  const [secondsLeft, setSecondsLeft] = useState(28);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

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
        <TextLine style={theme.typography.title}>Request unavailable</TextLine>
      </View>
    );
  }

  const payoutAll = 340;
  const tripDistanceKm = restaurant.distanceKm + 1.4;
  const totalTripMinutes = restaurant.etaMinutes + 5;

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
            styles.hero,
            {
              backgroundColor: theme.colors.surface.base,
              borderBottomLeftRadius: theme.radii.xl,
              borderBottomRightRadius: theme.radii.xl
            }
          ]}
        >
          <View style={styles.heroTopRow}>
            <View>
              <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
                New request
              </TextLine>
              <TextLine style={theme.typography.display}>Delivery offer</TextLine>
            </View>
            <View
              style={[
                styles.timerBadge,
                {
                  backgroundColor: theme.colors.brand.primaryMuted,
                  borderRadius: theme.radii.pill
                }
              ]}
            >
              <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
                Expires in
              </TextLine>
              <TextLine style={theme.typography.headline}>{secondsLeft}s</TextLine>
            </View>
          </View>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Accept quickly to lock the route before the next nearby courier gets it.
          </TextLine>
        </View>

        <Surface style={styles.offerCard}>
          <View style={styles.offerTopRow}>
            <View style={styles.offerValue}>
              <TextLine style={theme.typography.micro} color={theme.colors.text.secondary}>
                Earnings
              </TextLine>
              <TextLine style={theme.typography.titleLarge}>{formatAll(payoutAll)}</TextLine>
            </View>
            <View style={styles.offerValue}>
              <TextLine style={theme.typography.micro} color={theme.colors.text.secondary}>
                Total time
              </TextLine>
              <TextLine style={theme.typography.titleLarge}>{formatEta(totalTripMinutes)}</TextLine>
            </View>
          </View>

          <View style={styles.routeCard}>
            <StopRow
              label="Pickup"
              title={restaurant.name}
              detail={`${restaurant.distanceKm.toFixed(1)} km away · Ready in 6 min`}
              tone="pickup"
            />
            <StopRow
              label="Dropoff"
              title="Hotel Enkelana, promenade entrance"
              detail={`${tripDistanceKm.toFixed(1)} km total route · Customer note: call on arrival`}
              tone="dropoff"
            />
          </View>

          <View style={styles.metaGrid}>
            <MetaTile label="Items" value="3 dishes · 1 drink" />
            <MetaTile label="Restaurant wait" value="6 min" />
            <MetaTile label="Payment" value="Paid online" />
            <MetaTile label="Zone" value="Lake Promenade" />
          </View>
        </Surface>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.surface.base,
            borderTopColor: theme.colors.border.subtle
          },
          theme.shadows.sheet
        ]}
      >
        <SecondaryButton onPress={onDecline} style={styles.footerButton}>
          Decline
        </SecondaryButton>
        <PrimaryButton onPress={onAccept} style={styles.footerButton}>
          Accept request
        </PrimaryButton>
      </View>
    </View>
  );
};

interface StopRowProps {
  label: string;
  title: string;
  detail: string;
  tone: "pickup" | "dropoff";
}

const StopRow = ({ label, title, detail, tone }: StopRowProps) => {
  const theme = useBukeTheme();
  const markerColor =
    tone === "pickup" ? theme.colors.brand.primary : theme.colors.surface.inverse;

  return (
    <View style={styles.stopRow}>
      <View style={styles.stopRail}>
        <View
          style={[
            styles.stopMarker,
            {
              backgroundColor: markerColor
            }
          ]}
        />
        <View
          style={[
            styles.stopLine,
            {
              backgroundColor: theme.colors.border.subtle
            }
          ]}
        />
      </View>
      <View style={styles.stopCopy}>
        <TextLine style={theme.typography.micro} color={theme.colors.text.secondary}>
          {label}
        </TextLine>
        <TextLine style={theme.typography.headline}>{title}</TextLine>
        <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
          {detail}
        </TextLine>
      </View>
    </View>
  );
};

interface MetaTileProps {
  label: string;
  value: string;
}

const MetaTile = ({ label, value }: MetaTileProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.metaTile,
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
    paddingBottom: 140,
    gap: 18
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 10
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  timerBadge: {
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  offerCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 18
  },
  offerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  offerValue: {
    gap: 4
  },
  routeCard: {
    gap: 10
  },
  stopRow: {
    flexDirection: "row",
    gap: 12
  },
  stopRail: {
    width: 18,
    alignItems: "center"
  },
  stopMarker: {
    width: 12,
    height: 12,
    borderRadius: 999
  },
  stopLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 24
  },
  stopCopy: {
    flex: 1,
    gap: 2
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metaTile: {
    width: "47%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    gap: 10
  },
  footerButton: {
    flex: 1
  }
});
