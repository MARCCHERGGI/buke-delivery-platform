import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { SecondaryButton, PrimaryButton, Surface, TextLine } from "../components/shared";
import { useBukeTheme } from "../theme";

export interface BukeDriverDeliveryConfirmationScreenProps {
  onConfirmDelivery?: () => void;
}

export const BukeDriverDeliveryConfirmationScreen = ({
  onConfirmDelivery
}: BukeDriverDeliveryConfirmationScreenProps) => {
  const theme = useBukeTheme();

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
            Delivery confirmation
          </TextLine>
          <TextLine style={theme.typography.display}>Finish the order</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Confirm the handoff once the customer has the full order.
          </TextLine>
        </View>

        <Surface style={styles.customerCard}>
          <TextLine style={theme.typography.title}>Eni Shehu</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Hotel Enkelana, promenade entrance, blue gate on the right
          </TextLine>
          <View style={styles.customerMetaRow}>
            <MetaChip label="PIN" value="3812" />
            <MetaChip label="Payment" value="Paid online" />
          </View>
        </Surface>

        <Surface style={styles.noteCard}>
          <TextLine style={theme.typography.title}>Dropoff notes</TextLine>
          <ChecklistItem label="Customer PIN entered or verbally confirmed" />
          <ChecklistItem label="All items handed over" />
          <ChecklistItem label="No support issue or missing bag reported" />
        </Surface>

        <Surface style={styles.proofCard}>
          <TextLine style={theme.typography.title}>Proof of delivery</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            If the customer is unavailable, contact support before closing the order.
          </TextLine>
          <View style={styles.proofRow}>
            <ProofTile label="Method" value="PIN handoff" />
            <ProofTile label="Status" value="Ready to confirm" />
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
        <SecondaryButton style={styles.footerButton}>Need help</SecondaryButton>
        <PrimaryButton onPress={onConfirmDelivery} style={styles.footerButton}>
          Confirm delivery
        </PrimaryButton>
      </View>
    </View>
  );
};

interface MetaChipProps {
  label: string;
  value: string;
}

const MetaChip = ({ label, value }: MetaChipProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.metaChip,
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

interface ProofTileProps {
  label: string;
  value: string;
}

const ProofTile = ({ label, value }: ProofTileProps) => {
  const theme = useBukeTheme();

  return (
    <View
      style={[
        styles.proofTile,
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

interface ChecklistItemProps {
  label: string;
}

const ChecklistItem = ({ label }: ChecklistItemProps) => {
  const theme = useBukeTheme();

  return (
    <View style={styles.checklistItem}>
      <View
        style={[
          styles.checkDot,
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
  customerCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 12
  },
  customerMetaRow: {
    flexDirection: "row",
    gap: 10
  },
  metaChip: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2
  },
  noteCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 14
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  checkDot: {
    width: 12,
    height: 12,
    borderRadius: 999
  },
  proofCard: {
    marginHorizontal: 16,
    padding: 18,
    gap: 12
  },
  proofRow: {
    flexDirection: "row",
    gap: 10
  },
  proofTile: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2
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
