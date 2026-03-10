import React, { startTransition, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Surface, PrimaryButton, TextLine } from "../components/shared";
import { useBukeTheme } from "../theme";

export interface BukeDriverStatusScreenProps {
  initialOnline?: boolean;
}

export const BukeDriverStatusScreen = ({
  initialOnline = true
}: BukeDriverStatusScreenProps) => {
  const theme = useBukeTheme();
  const [isOnline, setIsOnline] = useState(initialOnline);

  const toggleLabel = isOnline ? "Go offline" : "Go online";
  const statusLabel = isOnline ? "Online and taking requests" : "Offline";
  const statusDetail = isOnline
    ? "You are visible for nearby delivery offers within the active 3 km zone."
    : "You are hidden from dispatch until you go online again.";

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
              backgroundColor: isOnline
                ? theme.colors.brand.primaryMuted
                : theme.colors.surface.base,
              borderBottomLeftRadius: theme.radii.xl,
              borderBottomRightRadius: theme.radii.xl
            }
          ]}
        >
          <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
            Driver mode
          </TextLine>
          <TextLine style={theme.typography.display}>Ready to drive</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Stay close to City Center for the fastest offer cycle.
          </TextLine>
        </View>

        <Surface style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusCopy}>
              <TextLine style={theme.typography.title}>{statusLabel}</TextLine>
              <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
                {statusDetail}
              </TextLine>
            </View>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOnline
                    ? theme.colors.brand.primary
                    : theme.colors.text.tertiary
                }
              ]}
            />
          </View>
          <PrimaryButton
            onPress={() => {
              startTransition(() => {
                setIsOnline((current) => !current);
              });
            }}
          >
            {toggleLabel}
          </PrimaryButton>
        </Surface>

        <View style={styles.metricsGrid}>
          <MetricTile title="Today" value="3,420 ALL" subtitle="Estimated earnings" />
          <MetricTile title="Trips" value="7" subtitle="Completed deliveries" />
          <MetricTile title="Acceptance" value="96%" subtitle="Last 7 days" />
        </View>

        <Surface style={styles.suggestionCard}>
          <TextLine style={theme.typography.title}>Repositioning</TextLine>
          <View style={styles.suggestionBlock}>
            <TextLine style={theme.typography.label}>Best waiting zone</TextLine>
            <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
              City Center is the best idle position right now. Lake Promenade demand is rising
              for the next 30 minutes.
            </TextLine>
          </View>
          <View style={styles.zoneRow}>
            <ZoneChip label="City Center" tone="active" />
            <ZoneChip label="Tourism Hotels" tone="neutral" />
            <ZoneChip label="Lake Promenade" tone="hot" />
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
};

interface MetricTileProps {
  title: string;
  value: string;
  subtitle: string;
}

const MetricTile = ({ title, value, subtitle }: MetricTileProps) => {
  const theme = useBukeTheme();

  return (
    <Surface style={styles.metricTile}>
      <TextLine style={theme.typography.micro} color={theme.colors.text.secondary}>
        {title}
      </TextLine>
      <TextLine style={theme.typography.title}>{value}</TextLine>
      <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
        {subtitle}
      </TextLine>
    </Surface>
  );
};

interface ZoneChipProps {
  label: string;
  tone: "active" | "hot" | "neutral";
}

const ZoneChip = ({ label, tone }: ZoneChipProps) => {
  const theme = useBukeTheme();

  const backgroundColor =
    tone === "active"
      ? theme.colors.brand.primaryMuted
      : tone === "hot"
        ? "#FFF0D8"
        : theme.colors.surface.sunken;
  const textColor =
    tone === "hot"
      ? "#A15C00"
      : tone === "active"
        ? theme.colors.brand.primary
        : theme.colors.text.secondary;

  return (
    <View
      style={[
        styles.zoneChip,
        {
          backgroundColor,
          borderRadius: theme.radii.pill
        }
      ]}
    >
      <TextLine style={theme.typography.label} color={textColor}>
        {label}
      </TextLine>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    paddingBottom: 40,
    gap: 18
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 8
  },
  statusCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 16
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  statusCopy: {
    flex: 1,
    gap: 4
  },
  statusDot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    marginTop: 6
  },
  metricsGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  metricTile: {
    width: "47%",
    padding: 16,
    gap: 6
  },
  suggestionCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 14
  },
  suggestionBlock: {
    gap: 4
  },
  zoneRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  zoneChip: {
    paddingHorizontal: 12,
    paddingVertical: 10
  }
});
