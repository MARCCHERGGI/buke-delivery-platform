import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { useBukeTheme } from "../theme";
import { PrimaryButton, Surface, TextLine } from "./shared";

export interface DriverCardProps {
  name: string;
  vehicleLabel: string;
  rating: number;
  completedTrips: number;
  arrivalLabel: string;
  avatarUri?: string;
  onCall?: () => void;
}

export const DriverCard = ({
  name,
  vehicleLabel,
  rating,
  completedTrips,
  arrivalLabel,
  avatarUri,
  onCall
}: DriverCardProps) => {
  const theme = useBukeTheme();

  return (
    <Surface style={styles.container}>
      <View style={styles.leftBlock}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.surface.sunken
              }
            ]}
          />
        )}
        <View style={styles.info}>
          <TextLine style={theme.typography.headline}>{name}</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            {vehicleLabel}
          </TextLine>
          <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
            {rating.toFixed(1)} rating  {completedTrips} trips
          </TextLine>
        </View>
      </View>
      <View style={styles.rightBlock}>
        <TextLine style={theme.typography.label}>{arrivalLabel}</TextLine>
        <PrimaryButton onPress={onCall} style={styles.button}>
          Call
        </PrimaryButton>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16
  },
  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18
  },
  info: {
    flex: 1,
    gap: 2
  },
  rightBlock: {
    alignItems: "flex-end",
    gap: 8
  },
  button: {
    minWidth: 88,
    minHeight: 40
  }
});
