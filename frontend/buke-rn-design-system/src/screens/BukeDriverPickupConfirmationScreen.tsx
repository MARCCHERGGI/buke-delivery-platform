import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SecondaryButton, PrimaryButton, Surface, TextLine } from "../components/shared";
import { getRestaurantPageData } from "../data/pogradecRestaurantMenus";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";

export interface BukeDriverPickupConfirmationScreenProps {
  restaurantId?: string;
  onConfirmPickup?: () => void;
}

export const BukeDriverPickupConfirmationScreen = ({
  restaurantId = "casa-di-pizza",
  onConfirmPickup
}: BukeDriverPickupConfirmationScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);
  const pageData = getRestaurantPageData(restaurantId);

  if (!restaurant || !pageData) {
    return (
      <View
        style={[
          styles.emptyScreen,
          {
            backgroundColor: theme.colors.surface.canvas
          }
        ]}
      >
        <TextLine style={theme.typography.title}>Pickup unavailable</TextLine>
      </View>
    );
  }

  const pickupItems = pageData.sections.flatMap((section) => section.items).slice(0, 3);

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
          <TextLine style={theme.typography.micro} color={theme.colors.brand.primary}>
            Pickup confirmation
          </TextLine>
          <TextLine style={theme.typography.display}>Confirm the handoff</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Verify the order before leaving the restaurant to avoid redelivery issues.
          </TextLine>
        </View>

        <Surface style={styles.codeCard}>
          <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
            Pickup code
          </TextLine>
          <TextLine style={theme.typography.titleLarge}>BKE-2041</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Restaurant: {restaurant.name}
          </TextLine>
        </Surface>

        <Surface style={styles.itemsCard}>
          <TextLine style={theme.typography.title}>Order contents</TextLine>
          {pickupItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < pickupItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border.subtle
                }
              ]}
            >
              <TextLine style={theme.typography.bodyStrong}>1x {item.name}</TextLine>
              <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
                {item.tagLabel ?? "Packed and sealed"}
              </TextLine>
            </View>
          ))}
        </Surface>

        <Surface style={styles.checklistCard}>
          <TextLine style={theme.typography.title}>Checklist</TextLine>
          <ChecklistItem label="Code matches the bag receipt" />
          <ChecklistItem label="Counted all bags and drink cups" />
          <ChecklistItem label="Packaging is closed and safe for transport" />
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
        <SecondaryButton style={styles.footerButton}>Problem at pickup</SecondaryButton>
        <PrimaryButton onPress={onConfirmPickup} style={styles.footerButton}>
          Confirm pickup
        </PrimaryButton>
      </View>
    </View>
  );
};

interface ChecklistItemProps {
  label: string;
}

const ChecklistItem = ({ label }: ChecklistItemProps) => {
  const theme = useBukeTheme();

  return (
    <View style={styles.checklistItem}>
      <View
        style={[
          styles.checkIcon,
          {
            backgroundColor: theme.colors.brand.primary
          }
        ]}
      />
      <TextLine style={theme.typography.body}>{label}</TextLine>
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
    gap: 8
  },
  codeCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 4
  },
  itemsCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 6
  },
  itemRow: {
    gap: 4,
    paddingVertical: 12
  },
  checklistCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 14
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  checkIcon: {
    width: 12,
    height: 12,
    borderRadius: 999
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
