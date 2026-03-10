import { BadRequestError, ConflictError, NotFoundError } from "../errors.js";
import { withTransaction } from "../db.js";
import {
  cancelPendingOffersTx,
  dispatchAcceptedOrderTx
} from "./dispatch-service.js";
import {
  enqueueOrderNotificationsTx,
  getNotificationEventForOrderStatus
} from "./notifications-service.js";

const DRIVER_REQUIRED_STATES = new Set([
  "driver_assigned",
  "driver_arriving",
  "picked_up",
  "delivered"
]);

export const getOrderSnapshotTx = async (client, orderId) => {
  const orderResult = await client.query(
    `
      SELECT
        o.id,
        o.status,
        o.user_id AS "userId",
        u.full_name AS "customerName",
        o.restaurant_id AS "restaurantId",
        r.name AS "restaurantName",
        o.driver_id AS "driverId",
        d.status AS "driverStatus",
        o.customer_address_text AS "customerAddressText",
        o.customer_latitude AS "customerLatitude",
        o.customer_longitude AS "customerLongitude",
        o.customer_note AS "customerNote",
        o.subtotal_amount_all AS "subtotalAmountAll",
        o.delivery_fee_all AS "deliveryFeeAll",
        o.service_fee_all AS "serviceFeeAll",
        o.discount_amount_all AS "discountAmountAll",
        o.total_amount_all AS "totalAmountAll",
        o.placed_at AS "placedAt",
        o.restaurant_accepted_at AS "restaurantAcceptedAt",
        o.driver_assigned_at AS "driverAssignedAt",
        o.driver_arriving_at AS "driverArrivingAt",
        o.picked_up_at AS "pickedUpAt",
        o.delivered_at AS "deliveredAt",
        o.cancelled_at AS "cancelledAt",
        o.created_at AS "createdAt",
        o.updated_at AS "updatedAt"
      FROM buke.orders o
      JOIN buke.users u ON u.id = o.user_id
      JOIN buke.restaurants r ON r.id = o.restaurant_id
      LEFT JOIN buke.drivers d ON d.id = o.driver_id
      WHERE o.id = $1
    `,
    [orderId]
  );

  if (orderResult.rowCount === 0) {
    throw new NotFoundError("Order not found");
  }

  const itemsResult = await client.query(
    `
      SELECT
        oi.id,
        oi.menu_item_id AS "menuItemId",
        oi.item_name_snapshot AS "itemName",
        oi.quantity,
        oi.unit_price_all AS "unitPriceAll",
        oi.total_price_all AS "totalPriceAll",
        oi.created_at AS "createdAt"
      FROM buke.order_items oi
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC, oi.id ASC
    `,
    [orderId]
  );

  const eventsResult = await client.query(
    `
      SELECT
        oe.id,
        oe.event_type AS "eventType",
        oe.actor_kind AS "actorKind",
        oe.actor_user_id AS "actorUserId",
        oe.actor_driver_id AS "actorDriverId",
        oe.payload,
        oe.occurred_at AS "occurredAt"
      FROM buke.order_events oe
      WHERE oe.order_id = $1
      ORDER BY oe.occurred_at ASC, oe.id ASC
    `,
    [orderId]
  );

  const order = orderResult.rows[0];
  order.items = itemsResult.rows;
  order.events = eventsResult.rows;

  if (order.driverId) {
    const driverLocationResult = await client.query(
      `
        SELECT
          dl.latitude,
          dl.longitude,
          dl.heading_degrees AS "headingDegrees",
          dl.speed_mps AS "speedMps",
          dl.accuracy_meters AS "accuracyMeters",
          dl.recorded_at AS "recordedAt"
        FROM buke.driver_locations dl
        WHERE dl.driver_id = $1
          AND (dl.order_id = $2 OR dl.order_id IS NULL)
        ORDER BY dl.recorded_at DESC
        LIMIT 1
      `,
      [order.driverId, orderId]
    );

    order.driverLocation = driverLocationResult.rows[0] ?? null;
  } else {
    order.driverLocation = null;
  }

  return order;
};

export const getOrderById = async (orderId) =>
  withTransaction(async (client) => getOrderSnapshotTx(client, orderId));

export const createOrder = async (payload) =>
  withTransaction(async (client) => {
    const userResult = await client.query(
      "SELECT id, is_active FROM buke.users WHERE id = $1",
      [payload.userId]
    );

    if (userResult.rowCount === 0 || !userResult.rows[0].is_active) {
      throw new BadRequestError("User does not exist or is inactive");
    }

    const restaurantResult = await client.query(
      `
        SELECT id, is_active, is_open
        FROM buke.restaurants
        WHERE id = $1
      `,
      [payload.restaurantId]
    );

    if (restaurantResult.rowCount === 0) {
      throw new NotFoundError("Restaurant not found");
    }

    const restaurant = restaurantResult.rows[0];

    if (!restaurant.is_active) {
      throw new ConflictError("Restaurant is inactive");
    }

    if (!restaurant.is_open) {
      throw new ConflictError("Restaurant is currently closed");
    }

    const menuItemIds = payload.items.map((item) => item.menuItemId);
    const menuItemsResult = await client.query(
      `
        SELECT id, name, price_amount_all AS "priceAmountAll", is_available
        FROM buke.menu_items
        WHERE restaurant_id = $1
          AND id = ANY($2::uuid[])
      `,
      [payload.restaurantId, menuItemIds]
    );

    if (menuItemsResult.rowCount !== menuItemIds.length) {
      throw new BadRequestError("One or more menu items do not belong to the restaurant");
    }

    const menuItemById = new Map(
      menuItemsResult.rows.map((menuItem) => [menuItem.id, menuItem])
    );

    for (const item of payload.items) {
      const menuItem = menuItemById.get(item.menuItemId);

      if (!menuItem.is_available) {
        throw new ConflictError(`Menu item is unavailable: ${menuItem.name}`);
      }
    }

    const lineItems = payload.items.map((item) => {
      const menuItem = menuItemById.get(item.menuItemId);
      const totalPriceAll = menuItem.priceAmountAll * item.quantity;

      return {
        menuItemId: item.menuItemId,
        itemNameSnapshot: menuItem.name,
        quantity: item.quantity,
        unitPriceAll: menuItem.priceAmountAll,
        totalPriceAll
      };
    });

    const subtotalAmountAll = lineItems.reduce(
      (sum, item) => sum + item.totalPriceAll,
      0
    );

    const orderInsertResult = await client.query(
      `
        INSERT INTO buke.orders (
          user_id,
          restaurant_id,
          customer_address_text,
          customer_latitude,
          customer_longitude,
          customer_note,
          subtotal_amount_all,
          delivery_fee_all,
          service_fee_all,
          discount_amount_all
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
      [
        payload.userId,
        payload.restaurantId,
        payload.customerAddressText,
        payload.customerLatitude,
        payload.customerLongitude,
        payload.customerNote ?? null,
        subtotalAmountAll,
        payload.deliveryFeeAll,
        payload.serviceFeeAll,
        payload.discountAmountAll
      ]
    );

    const orderId = orderInsertResult.rows[0].id;

    for (const item of lineItems) {
      await client.query(
        `
          INSERT INTO buke.order_items (
            order_id,
            menu_item_id,
            item_name_snapshot,
            quantity,
            unit_price_all,
            total_price_all
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          orderId,
          item.menuItemId,
          item.itemNameSnapshot,
          item.quantity,
          item.unitPriceAll,
          item.totalPriceAll
        ]
      );
    }

    const orderSnapshot = await getOrderSnapshotTx(client, orderId);
    await enqueueOrderNotificationsTx(client, {
      eventType: "order_created",
      orderId
    });

    return orderSnapshot;
  });

export const updateOrderStatus = async (orderId, payload) =>
  withTransaction(async (client) => {
    const orderResult = await client.query(
      `
        SELECT id, status, driver_id AS "driverId"
        FROM buke.orders
        WHERE id = $1
        FOR UPDATE
      `,
      [orderId]
    );

    if (orderResult.rowCount === 0) {
      throw new NotFoundError("Order not found");
    }

    const order = orderResult.rows[0];

    if (payload.status === order.status) {
      return getOrderSnapshotTx(client, orderId);
    }

    const nextDriverId = payload.driverId ?? order.driverId ?? null;

    if (DRIVER_REQUIRED_STATES.has(payload.status) && !nextDriverId) {
      throw new BadRequestError(`driverId is required for status ${payload.status}`);
    }

    if (payload.driverId) {
      const driverResult = await client.query(
        `
          SELECT id, is_active, status
          FROM buke.drivers
          WHERE id = $1
          FOR UPDATE
        `,
        [payload.driverId]
      );

      if (driverResult.rowCount === 0 || !driverResult.rows[0].is_active) {
        throw new BadRequestError("Driver does not exist or is inactive");
      }

      const driver = driverResult.rows[0];
      const isExistingAssignedDriver = order.driverId === payload.driverId;

      if (
        DRIVER_REQUIRED_STATES.has(payload.status) &&
        !isExistingAssignedDriver &&
        driver.status !== "available"
      ) {
        throw new ConflictError("Driver must be available before assignment");
      }
    }

    await client.query(
      `
        UPDATE buke.orders
        SET status = $2,
            driver_id = COALESCE($3, driver_id)
        WHERE id = $1
      `,
      [orderId, payload.status, payload.driverId ?? null]
    );

    if (
      (payload.status === "driver_assigned" ||
        payload.status === "driver_arriving" ||
        payload.status === "picked_up") &&
      nextDriverId
    ) {
      await cancelPendingOffersTx(client, orderId, nextDriverId);
      await client.query(
        `
          UPDATE buke.drivers
          SET status = 'delivering'
          WHERE id = $1
        `,
        [nextDriverId]
      );
    }

    if (payload.status === "delivered" || payload.status === "cancelled") {
      const driverIdToRelease = nextDriverId;
      await cancelPendingOffersTx(client, orderId);

      if (driverIdToRelease) {
        await client.query(
          `
            UPDATE buke.drivers
            SET status = 'available'
            WHERE id = $1
          `,
          [driverIdToRelease]
        );
      }
    }

    const orderSnapshot = await getOrderSnapshotTx(client, orderId);

    if (payload.status === "restaurant_accepted") {
      orderSnapshot.dispatch = await dispatchAcceptedOrderTx(client, orderId);
    }

    const notificationEvent = getNotificationEventForOrderStatus(payload.status);

    if (notificationEvent) {
      await enqueueOrderNotificationsTx(client, {
        eventType: notificationEvent,
        orderId
      });
    }

    return orderSnapshot;
  });
