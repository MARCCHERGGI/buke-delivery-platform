import { BadRequestError, ConflictError, NotFoundError } from "../errors.js";
import { withTransaction } from "../db.js";
import { acceptDeliveryOfferTx } from "./dispatch-service.js";
import { getOrderSnapshotTx } from "./orders-service.js";

export const recordDriverLocation = async (payload) =>
  withTransaction(async (client) => {
    const driverResult = await client.query(
      `
        SELECT id, is_active
        FROM buke.drivers
        WHERE id = $1
        FOR UPDATE
      `,
      [payload.driverId]
    );

    if (driverResult.rowCount === 0 || !driverResult.rows[0].is_active) {
      throw new BadRequestError("Driver does not exist or is inactive");
    }

    if (payload.orderId) {
      const orderResult = await client.query(
        `
          SELECT id, driver_id AS "driverId"
          FROM buke.orders
          WHERE id = $1
        `,
        [payload.orderId]
      );

      if (orderResult.rowCount === 0) {
        throw new NotFoundError("Order not found");
      }

      const order = orderResult.rows[0];

      if (order.driverId !== payload.driverId) {
        throw new ConflictError("Driver is not assigned to this order");
      }
    }

    const recordedAt = payload.recordedAt ? new Date(payload.recordedAt) : new Date();

    const locationResult = await client.query(
      `
        INSERT INTO buke.driver_locations (
          driver_id,
          order_id,
          latitude,
          longitude,
          heading_degrees,
          speed_mps,
          accuracy_meters,
          recorded_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          driver_id AS "driverId",
          order_id AS "orderId",
          latitude,
          longitude,
          heading_degrees AS "headingDegrees",
          speed_mps AS "speedMps",
          accuracy_meters AS "accuracyMeters",
          recorded_at AS "recordedAt"
      `,
      [
        payload.driverId,
        payload.orderId ?? null,
        payload.latitude,
        payload.longitude,
        payload.headingDegrees ?? null,
        payload.speedMps ?? null,
        payload.accuracyMeters ?? null,
        recordedAt
      ]
    );

    await client.query(
      `
        UPDATE buke.drivers
        SET current_latitude = $2,
            current_longitude = $3,
            last_seen_at = $4
        WHERE id = $1
      `,
      [payload.driverId, payload.latitude, payload.longitude, recordedAt]
    );

    return locationResult.rows[0];
  });

export const acceptOrder = async ({ driverId, orderId }) =>
  withTransaction(async (client) => {
    const driverResult = await client.query(
      `
        SELECT id, is_active, status
        FROM buke.drivers
        WHERE id = $1
        FOR UPDATE
      `,
      [driverId]
    );

    if (driverResult.rowCount === 0 || !driverResult.rows[0].is_active) {
      throw new BadRequestError("Driver does not exist or is inactive");
    }

    await acceptDeliveryOfferTx(client, { driverId, orderId });

    return getOrderSnapshotTx(client, orderId);
  });
