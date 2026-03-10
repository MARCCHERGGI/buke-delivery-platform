import React, { startTransition, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PrimaryButton, SecondaryButton, Surface, TextLine } from "../components/shared";
import {
  MerchantOrder,
  MerchantOrderStatus,
  getMerchantDashboardData
} from "../data/merchantDashboardData";
import { pogradecRestaurants } from "../data/pogradecRestaurants";
import { useBukeTheme } from "../theme";
import { formatAll } from "../utils/format";

export interface BukeRestaurantDashboardScreenProps {
  restaurantId?: string;
}

export const BukeRestaurantDashboardScreen = ({
  restaurantId = "casa-di-pizza"
}: BukeRestaurantDashboardScreenProps) => {
  const theme = useBukeTheme();
  const restaurant = pogradecRestaurants.find((entry) => entry.id === restaurantId);
  const dashboardData = getMerchantDashboardData(restaurantId);
  const [incomingOrders, setIncomingOrders] = useState<MerchantOrder[]>(
    dashboardData.incomingOrders
  );
  const [orderHistory, setOrderHistory] = useState<MerchantOrder[]>(dashboardData.orderHistory);

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
        <TextLine style={theme.typography.title}>Dashboard unavailable</TextLine>
      </View>
    );
  }

  const incomingCount = incomingOrders.filter((order) => order.status === "incoming").length;
  const acceptedCount = incomingOrders.filter((order) => order.status === "accepted").length;
  const readyCount = incomingOrders.filter((order) => order.status === "ready").length;

  const updateOrder = (orderId: string, nextStatus: MerchantOrderStatus) => {
    startTransition(() => {
      setIncomingOrders((current) => {
        const targetOrder = current.find((order) => order.id === orderId);

        if (!targetOrder) {
          return current;
        }

        if (nextStatus === "rejected" || nextStatus === "completed") {
          setOrderHistory((history) => [
            {
              ...targetOrder,
              status: nextStatus,
              scheduledLabel: nextStatus === "completed" ? "Completed" : "Rejected",
              createdAtLabel: "Just now",
              prepTimeMinutes: 0
            },
            ...history
          ]);

          return current.filter((order) => order.id !== orderId);
        }

        return current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus,
                scheduledLabel:
                  nextStatus === "accepted"
                    ? "Preparing now"
                    : "Waiting for courier pickup",
                prepTimeMinutes: nextStatus === "accepted" ? Math.max(order.prepTimeMinutes - 4, 4) : 0
              }
            : order
        );
      });
    });
  };

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
            Merchant dashboard
          </TextLine>
          <TextLine style={theme.typography.display}>{restaurant.name}</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            Incoming orders, kitchen actions, and order history for the current shift.
          </TextLine>

          <View style={styles.metricsRow}>
            <MetricCard label="Incoming" value={String(incomingCount)} tone="incoming" />
            <MetricCard label="Preparing" value={String(acceptedCount)} tone="active" />
            <MetricCard label="Ready" value={String(readyCount)} tone="ready" />
            <MetricCard label="History" value={String(orderHistory.length)} tone="neutral" />
          </View>
        </View>

        <View
          style={[
            styles.dashboardLayout,
            styles.dashboardLayoutTablet
          ]}
        >
          <View style={styles.primaryColumn}>
            <Surface style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <TextLine style={theme.typography.title}>Incoming orders</TextLine>
                  <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
                    Accept, reject, or mark ready as the kitchen progresses.
                  </TextLine>
                </View>
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: theme.colors.brand.primaryMuted,
                      borderRadius: theme.radii.pill
                    }
                  ]}
                >
                  <TextLine style={theme.typography.label}>{incomingOrders.length} live</TextLine>
                </View>
              </View>

              <View style={styles.orderList}>
                {incomingOrders.map((order) => (
                  <LiveOrderCard
                    key={order.id}
                    order={order}
                    onAccept={() => updateOrder(order.id, "accepted")}
                    onReject={() => updateOrder(order.id, "rejected")}
                    onMarkReady={() => updateOrder(order.id, "ready")}
                    onComplete={() => updateOrder(order.id, "completed")}
                  />
                ))}
              </View>
            </Surface>
          </View>

          <View style={styles.secondaryColumn}>
            <Surface style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <TextLine style={theme.typography.title}>Order history</TextLine>
                  <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
                    Recent completed and rejected orders for this shift.
                  </TextLine>
                </View>
              </View>

              <View style={styles.historyList}>
                {orderHistory.map((order) => (
                  <HistoryOrderRow key={order.id} order={order} />
                ))}
              </View>
            </Surface>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  tone: "incoming" | "active" | "ready" | "neutral";
}

const MetricCard = ({ label, value, tone }: MetricCardProps) => {
  const theme = useBukeTheme();
  const backgroundColor =
    tone === "incoming"
      ? "#FFF3E3"
      : tone === "active"
        ? theme.colors.brand.primaryMuted
        : tone === "ready"
          ? "#E9F8FF"
          : theme.colors.surface.sunken;
  const valueColor =
    tone === "incoming"
      ? "#A55B00"
      : tone === "ready"
        ? "#0C73A8"
        : tone === "active"
          ? theme.colors.brand.primary
          : theme.colors.text.primary;

  return (
    <View
      style={[
        styles.metricCard,
        {
          backgroundColor,
          borderRadius: 18
        }
      ]}
    >
      <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
        {label}
      </TextLine>
      <TextLine style={theme.typography.title} color={valueColor}>
        {value}
      </TextLine>
    </View>
  );
};

interface LiveOrderCardProps {
  order: MerchantOrder;
  onAccept: () => void;
  onReject: () => void;
  onMarkReady: () => void;
  onComplete: () => void;
}

const LiveOrderCard = ({
  order,
  onAccept,
  onReject,
  onMarkReady,
  onComplete
}: LiveOrderCardProps) => {
  const theme = useBukeTheme();
  const statusLabel = getStatusLabel(order.status);
  const statusTone = getStatusTone(order.status);
  const statusBackgroundColor =
    statusTone === "incoming"
      ? "#FFF3E3"
      : statusTone === "ready"
        ? "#E9F8FF"
        : theme.colors.brand.primaryMuted;
  const statusTextColor =
    statusTone === "incoming"
      ? "#A55B00"
      : statusTone === "ready"
        ? "#0C73A8"
        : theme.colors.brand.primary;

  return (
    <View
      style={[
        styles.liveOrderCard,
        {
          borderColor: theme.colors.border.subtle,
          borderRadius: theme.radii.lg
        }
      ]}
    >
      <View style={styles.liveOrderTopRow}>
        <View style={styles.orderCopy}>
          <TextLine style={theme.typography.headline}>{order.id}</TextLine>
          <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
            {order.customerName} · {order.itemCount} items · {formatAll(order.totalAll)}
          </TextLine>
        </View>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: statusBackgroundColor,
              borderRadius: theme.radii.pill
            }
          ]}
        >
          <TextLine style={theme.typography.label} color={statusTextColor}>
            {statusLabel}
          </TextLine>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <DashboardMetaTile label="Created" value={order.createdAtLabel} />
        <DashboardMetaTile label="Target" value={order.scheduledLabel} />
        <DashboardMetaTile label="Prep" value={`${order.prepTimeMinutes} min`} />
        <DashboardMetaTile label="Type" value={order.orderTypeLabel} />
      </View>

      <View style={styles.linesBlock}>
        {order.lines.map((line) => (
          <View key={line.id} style={styles.lineRow}>
            <TextLine style={theme.typography.bodyStrong}>
              {line.quantity}x {line.name}
            </TextLine>
          </View>
        ))}
      </View>

      {order.customerNote ? (
        <View
          style={[
            styles.noteBlock,
            {
              backgroundColor: theme.colors.surface.sunken,
              borderRadius: theme.radii.lg
            }
          ]}
        >
          <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
            Customer note
          </TextLine>
          <TextLine style={theme.typography.body}>{order.customerNote}</TextLine>
        </View>
      ) : null}

      {order.courierLabel ? (
        <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
          Courier: {order.courierLabel}
        </TextLine>
      ) : null}

      <View style={styles.actionRow}>
        {order.status === "incoming" ? (
          <>
            <SecondaryButton style={styles.actionButton} onPress={onReject}>
              Reject
            </SecondaryButton>
            <PrimaryButton style={styles.actionButton} onPress={onAccept}>
              Accept
            </PrimaryButton>
          </>
        ) : null}
        {order.status === "accepted" ? (
          <>
            <SecondaryButton style={styles.actionButton} onPress={onReject}>
              Reject
            </SecondaryButton>
            <PrimaryButton style={styles.actionButton} onPress={onMarkReady}>
              Mark ready
            </PrimaryButton>
          </>
        ) : null}
        {order.status === "ready" ? (
          <PrimaryButton style={styles.fullWidthButton} onPress={onComplete}>
            Move to history
          </PrimaryButton>
        ) : null}
      </View>
    </View>
  );
};

interface DashboardMetaTileProps {
  label: string;
  value: string;
}

const DashboardMetaTile = ({ label, value }: DashboardMetaTileProps) => {
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

interface HistoryOrderRowProps {
  order: MerchantOrder;
}

const HistoryOrderRow = ({ order }: HistoryOrderRowProps) => {
  const theme = useBukeTheme();
  const historyTone = order.status === "completed" ? theme.colors.brand.primary : theme.colors.text.danger;

  return (
    <View
      style={[
        styles.historyRow,
        {
          borderBottomColor: theme.colors.border.subtle
        }
      ]}
    >
      <View style={styles.historyCopy}>
        <TextLine style={theme.typography.label}>{order.id}</TextLine>
        <TextLine style={theme.typography.body} color={theme.colors.text.secondary}>
          {order.customerName} · {order.itemCount} items
        </TextLine>
      </View>
      <View style={styles.historyMeta}>
        <TextLine style={theme.typography.label} color={historyTone}>
          {order.scheduledLabel}
        </TextLine>
        <TextLine style={theme.typography.caption} color={theme.colors.text.secondary}>
          {formatAll(order.totalAll)} · {order.createdAtLabel}
        </TextLine>
      </View>
    </View>
  );
};

const getStatusLabel = (status: MerchantOrderStatus) => {
  switch (status) {
    case "incoming":
      return "Incoming";
    case "accepted":
      return "Preparing";
    case "ready":
      return "Ready";
    case "rejected":
      return "Rejected";
    case "completed":
      return "Completed";
    default:
      return "Live";
  }
};

const getStatusTone = (status: MerchantOrderStatus) => {
  switch (status) {
    case "incoming":
      return "incoming";
    case "ready":
      return "ready";
    default:
      return "active";
  }
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
    paddingBottom: 40,
    gap: 18
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    gap: 12
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  metricCard: {
    minWidth: 132,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4
  },
  dashboardLayout: {
    paddingHorizontal: 20,
    gap: 18
  },
  dashboardLayoutTablet: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  dashboardLayoutStacked: {
    flexDirection: "column"
  },
  primaryColumn: {
    flex: 1.35
  },
  secondaryColumn: {
    flex: 0.9
  },
  sectionCard: {
    padding: 18,
    gap: 16
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  orderList: {
    gap: 14
  },
  liveOrderCard: {
    borderWidth: 1,
    padding: 16,
    gap: 14
  },
  liveOrderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start"
  },
  orderCopy: {
    flex: 1,
    gap: 4
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metaTile: {
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2
  },
  linesBlock: {
    gap: 8
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  noteBlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
  },
  fullWidthButton: {
    flex: 1
  },
  historyList: {
    gap: 4
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1
  },
  historyCopy: {
    flex: 1,
    gap: 2
  },
  historyMeta: {
    alignItems: "flex-end",
    gap: 2
  }
});
