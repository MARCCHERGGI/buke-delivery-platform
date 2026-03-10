export type MerchantOrderStatus =
  | "incoming"
  | "accepted"
  | "ready"
  | "rejected"
  | "completed";

export interface MerchantOrderLine {
  id: string;
  name: string;
  quantity: number;
}

export interface MerchantOrder {
  id: string;
  customerName: string;
  status: MerchantOrderStatus;
  createdAtLabel: string;
  scheduledLabel: string;
  totalAll: number;
  itemCount: number;
  prepTimeMinutes: number;
  orderTypeLabel: string;
  courierLabel?: string;
  customerNote?: string;
  lines: MerchantOrderLine[];
}

export interface MerchantDashboardData {
  incomingOrders: MerchantOrder[];
  orderHistory: MerchantOrder[];
}

const merchantDashboardDataByRestaurantId: Record<string, MerchantDashboardData> = {
  "casa-di-pizza": {
    incomingOrders: [
      {
        id: "BKE-2041",
        customerName: "Eni Shehu",
        status: "incoming",
        createdAtLabel: "Just now",
        scheduledLabel: "Deliver by 19:12",
        totalAll: 1670,
        itemCount: 3,
        prepTimeMinutes: 14,
        orderTypeLabel: "Delivery",
        customerNote: "Call from downstairs. Blue gate next to the pharmacy.",
        lines: [
          { id: "l1", name: "Pizza Margherita", quantity: 1 },
          { id: "l2", name: "Pizza Diavola", quantity: 1 },
          { id: "l3", name: "Tiramisu", quantity: 1 }
        ]
      },
      {
        id: "BKE-2038",
        customerName: "Klea Muca",
        status: "accepted",
        createdAtLabel: "3 min ago",
        scheduledLabel: "Courier arrives in 5 min",
        totalAll: 1290,
        itemCount: 2,
        prepTimeMinutes: 9,
        orderTypeLabel: "Delivery",
        courierLabel: "Ardit Hoxha",
        lines: [
          { id: "l4", name: "Pizza Prosciutto e Funghi", quantity: 1 },
          { id: "l5", name: "Bruschetta", quantity: 1 }
        ]
      },
      {
        id: "BKE-2032",
        customerName: "Julian Doko",
        status: "ready",
        createdAtLabel: "11 min ago",
        scheduledLabel: "Waiting for courier pickup",
        totalAll: 1900,
        itemCount: 2,
        prepTimeMinutes: 0,
        orderTypeLabel: "Delivery",
        courierLabel: "Bledi Lila",
        lines: [
          { id: "l6", name: "Pizza 4 Stinet", quantity: 1 },
          { id: "l7", name: "Spaghetti Carbonara", quantity: 1 }
        ]
      }
    ],
    orderHistory: [
      {
        id: "BKE-2029",
        customerName: "Rina Hasa",
        status: "completed",
        createdAtLabel: "18:24",
        scheduledLabel: "Delivered",
        totalAll: 1540,
        itemCount: 2,
        prepTimeMinutes: 0,
        orderTypeLabel: "Delivery",
        courierLabel: "Ardit Hoxha",
        lines: [
          { id: "l8", name: "Pizza Margherita", quantity: 1 },
          { id: "l9", name: "Penne Arrabbiata", quantity: 1 }
        ]
      },
      {
        id: "BKE-2024",
        customerName: "Sara Laze",
        status: "rejected",
        createdAtLabel: "17:58",
        scheduledLabel: "Rejected",
        totalAll: 920,
        itemCount: 1,
        prepTimeMinutes: 0,
        orderTypeLabel: "Delivery",
        lines: [{ id: "l10", name: "Pizza Prosciutto e Funghi", quantity: 1 }]
      },
      {
        id: "BKE-2017",
        customerName: "Ermal Meta",
        status: "completed",
        createdAtLabel: "17:21",
        scheduledLabel: "Delivered",
        totalAll: 1100,
        itemCount: 2,
        prepTimeMinutes: 0,
        orderTypeLabel: "Pickup",
        lines: [
          { id: "l11", name: "Pizza Margherita", quantity: 1 },
          { id: "l12", name: "Bruschetta", quantity: 1 }
        ]
      }
    ]
  }
};

const buildFallbackDashboardData = (): MerchantDashboardData => ({
  incomingOrders: [
    {
      id: "BKE-3001",
      customerName: "Guest customer",
      status: "incoming",
      createdAtLabel: "Just now",
      scheduledLabel: "Deliver by 20:10",
      totalAll: 1240,
      itemCount: 2,
      prepTimeMinutes: 12,
      orderTypeLabel: "Delivery",
      lines: [
        { id: "f1", name: "House special", quantity: 1 },
        { id: "f2", name: "Side and drink", quantity: 1 }
      ]
    }
  ],
  orderHistory: [
    {
      id: "BKE-2995",
      customerName: "Walk-in archive",
      status: "completed",
      createdAtLabel: "18:05",
      scheduledLabel: "Completed",
      totalAll: 980,
      itemCount: 1,
      prepTimeMinutes: 0,
      orderTypeLabel: "Delivery",
      lines: [{ id: "f3", name: "Featured combo", quantity: 1 }]
    }
  ]
});

export const getMerchantDashboardData = (restaurantId: string): MerchantDashboardData =>
  merchantDashboardDataByRestaurantId[restaurantId] ?? buildFallbackDashboardData();
