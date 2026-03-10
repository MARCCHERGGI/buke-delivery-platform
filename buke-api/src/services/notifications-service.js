import { query, withTransaction } from "../db.js";
import { NotFoundError } from "../errors.js";

const formatAll = (amountAll) => `${amountAll.toLocaleString("en-US")} ALL`;

const toShortOrderCode = (orderId) => orderId.split("-")[0].toUpperCase();

const getNotificationContextTx = async (client, orderId) => {
  const result = await client.query(
    `
      SELECT
        o.id AS "orderId",
        o.status,
        o.user_id AS "userId",
        customer.full_name AS "customerName",
        o.restaurant_id AS "restaurantId",
        r.name AS "restaurantName",
        o.driver_id AS "driverId",
        driver_user.full_name AS "driverName",
        o.total_amount_all AS "totalAmountAll",
        COALESCE((
          SELECT SUM(oi.quantity)
          FROM buke.order_items oi
          WHERE oi.order_id = o.id
        ), 0)::integer AS "itemCount"
      FROM buke.orders o
      JOIN buke.users customer ON customer.id = o.user_id
      JOIN buke.restaurants r ON r.id = o.restaurant_id
      LEFT JOIN buke.drivers d ON d.id = o.driver_id
      LEFT JOIN buke.users driver_user ON driver_user.id = d.user_id
      WHERE o.id = $1
    `,
    [orderId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Order not found");
  }

  return result.rows[0];
};

const buildNotificationDrafts = (eventType, order) => {
  const orderCode = toShortOrderCode(order.orderId);
  const itemSummary = `${order.itemCount} item${order.itemCount === 1 ? "" : "s"}`;

  switch (eventType) {
    case "order_created":
      return [
        {
          recipientKind: "customer",
          recipientUserId: order.userId,
          title: `Order placed at ${order.restaurantName}`,
          body: `Your ${itemSummary} order is in. We will notify you when ${order.restaurantName} accepts it.`,
          payload: {
            orderStatus: order.status,
            restaurantName: order.restaurantName
          }
        },
        {
          recipientKind: "restaurant",
          recipientRestaurantId: order.restaurantId,
          title: `New order ${orderCode}`,
          body: `${order.customerName} placed ${itemSummary} worth ${formatAll(order.totalAmountAll)}.`,
          payload: {
            orderStatus: order.status,
            customerName: order.customerName,
            totalAmountAll: order.totalAmountAll
          }
        }
      ];

    case "restaurant_accepted":
      return [
        {
          recipientKind: "customer",
          recipientUserId: order.userId,
          title: `${order.restaurantName} accepted your order`,
          body: `The kitchen has started preparing your ${itemSummary}.`,
          payload: {
            orderStatus: order.status,
            restaurantName: order.restaurantName
          }
        }
      ];

    case "driver_assigned":
      return [
        {
          recipientKind: "customer",
          recipientUserId: order.userId,
          title: "Driver assigned",
          body: `${order.driverName ?? "Your courier"} is heading to ${order.restaurantName}.`,
          payload: {
            orderStatus: order.status,
            driverId: order.driverId,
            driverName: order.driverName ?? null
          }
        }
      ];

    case "driver_arriving":
      return [
        {
          recipientKind: "customer",
          recipientUserId: order.userId,
          title: "Courier is arriving at the restaurant",
          body: `${order.driverName ?? "Your courier"} is nearly at ${order.restaurantName} for pickup.`,
          payload: {
            orderStatus: order.status,
            driverId: order.driverId,
            driverName: order.driverName ?? null
          }
        },
        {
          recipientKind: "restaurant",
          recipientRestaurantId: order.restaurantId,
          title: "Courier arriving for pickup",
          body: `${order.driverName ?? "Assigned courier"} is arriving for order ${orderCode}.`,
          payload: {
            orderStatus: order.status,
            driverId: order.driverId,
            driverName: order.driverName ?? null
          }
        }
      ];

    case "order_delivered":
      return [
        {
          recipientKind: "customer",
          recipientUserId: order.userId,
          title: "Order delivered",
          body: `Your order from ${order.restaurantName} has been delivered. Enjoy your meal.`,
          payload: {
            orderStatus: order.status,
            driverId: order.driverId,
            driverName: order.driverName ?? null
          }
        }
      ];

    default:
      return [];
  }
};

const insertNotificationTx = async (client, { orderId, eventType, draft }) => {
  const result = await client.query(
    `
      INSERT INTO buke.notifications (
        order_id,
        event_type,
        recipient_kind,
        recipient_user_id,
        recipient_driver_id,
        recipient_restaurant_id,
        channel,
        title,
        body,
        payload
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'in_app', $7, $8, $9::jsonb)
      ON CONFLICT DO NOTHING
      RETURNING
        id,
        order_id AS "orderId",
        event_type AS "eventType",
        recipient_kind AS "recipientKind",
        recipient_user_id AS "recipientUserId",
        recipient_driver_id AS "recipientDriverId",
        recipient_restaurant_id AS "recipientRestaurantId",
        channel,
        title,
        body,
        payload,
        created_at AS "createdAt",
        read_at AS "readAt"
    `,
    [
      orderId,
      eventType,
      draft.recipientKind,
      draft.recipientUserId ?? null,
      draft.recipientDriverId ?? null,
      draft.recipientRestaurantId ?? null,
      draft.title,
      draft.body,
      JSON.stringify(draft.payload ?? {})
    ]
  );

  return result.rows[0] ?? null;
};

export const enqueueOrderNotificationsTx = async (client, { eventType, orderId }) => {
  const order = await getNotificationContextTx(client, orderId);
  const drafts = buildNotificationDrafts(eventType, order);
  const notifications = [];

  for (const draft of drafts) {
    const notification = await insertNotificationTx(client, {
      orderId,
      eventType,
      draft
    });

    if (notification) {
      notifications.push(notification);
    }
  }

  return notifications;
};

export const getNotificationEventForOrderStatus = (status) => {
  switch (status) {
    case "restaurant_accepted":
      return "restaurant_accepted";
    case "driver_assigned":
      return "driver_assigned";
    case "driver_arriving":
      return "driver_arriving";
    case "delivered":
      return "order_delivered";
    default:
      return null;
  }
};

export const listNotifications = async (filters) => {
  const params = [];
  const whereClauses = [];

  if (filters.userId) {
    params.push(filters.userId);
    whereClauses.push(`recipient_user_id = $${params.length}`);
  }

  if (filters.restaurantId) {
    params.push(filters.restaurantId);
    whereClauses.push(`recipient_restaurant_id = $${params.length}`);
  }

  if (filters.driverId) {
    params.push(filters.driverId);
    whereClauses.push(`recipient_driver_id = $${params.length}`);
  }

  if (filters.orderId) {
    params.push(filters.orderId);
    whereClauses.push(`order_id = $${params.length}`);
  }

  if (filters.unreadOnly) {
    whereClauses.push("read_at IS NULL");
  }

  params.push(filters.limit);

  const result = await query(
    `
      SELECT
        id,
        order_id AS "orderId",
        event_type AS "eventType",
        recipient_kind AS "recipientKind",
        recipient_user_id AS "recipientUserId",
        recipient_driver_id AS "recipientDriverId",
        recipient_restaurant_id AS "recipientRestaurantId",
        channel,
        title,
        body,
        payload,
        created_at AS "createdAt",
        read_at AS "readAt"
      FROM buke.notifications
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length}
    `,
    params
  );

  return result.rows;
};

export const markNotificationRead = async (notificationId) =>
  withTransaction(async (client) => {
    const result = await client.query(
      `
        UPDATE buke.notifications
        SET read_at = COALESCE(read_at, now())
        WHERE id = $1
        RETURNING
          id,
          order_id AS "orderId",
          event_type AS "eventType",
          recipient_kind AS "recipientKind",
          recipient_user_id AS "recipientUserId",
          recipient_driver_id AS "recipientDriverId",
          recipient_restaurant_id AS "recipientRestaurantId",
          channel,
          title,
          body,
          payload,
          created_at AS "createdAt",
          read_at AS "readAt"
      `,
      [notificationId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("Notification not found");
    }

    return result.rows[0];
  });
