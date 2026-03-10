import { config } from "../config.js";
import { ConflictError, NotFoundError } from "../errors.js";
import { enqueueOrderNotificationsTx } from "./notifications-service.js";

const toRadians = (value) => (value * Math.PI) / 180;

const haversineMeters = (from, to) => {
  const earthRadiusM = 6371000;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const markDriversAvailableForOffers = async (client, driverIds, excludeDriverId = null) => {
  const filteredDriverIds = driverIds.filter(
    (driverId) => driverId && driverId !== excludeDriverId
  );

  if (filteredDriverIds.length === 0) {
    return;
  }

  await client.query(
    `
      UPDATE buke.drivers
      SET status = 'available'
      WHERE id = ANY($1::uuid[])
        AND status = 'offered_delivery'
    `,
    [filteredDriverIds]
  );
};

export const expirePendingOffersTx = async (client, orderId = null) => {
  const params = [];
  const filters = ["status = 'pending'", "expires_at <= now()"];

  if (orderId) {
    params.push(orderId);
    filters.push(`order_id = $${params.length}`);
  }

  const expiredResult = await client.query(
    `
      UPDATE buke.delivery_offers
      SET status = 'expired',
          responded_at = now()
      WHERE ${filters.join(" AND ")}
      RETURNING driver_id AS "driverId"
    `,
    params
  );

  await markDriversAvailableForOffers(
    client,
    expiredResult.rows.map((row) => row.driverId)
  );
};

export const cancelPendingOffersTx = async (client, orderId, excludeDriverId = null) => {
  const cancelledResult = await client.query(
    `
      UPDATE buke.delivery_offers
      SET status = 'cancelled',
          responded_at = now()
      WHERE order_id = $1
        AND status = 'pending'
      RETURNING driver_id AS "driverId"
    `,
    [orderId]
  );

  await markDriversAvailableForOffers(
    client,
    cancelledResult.rows.map((row) => row.driverId),
    excludeDriverId
  );
};

const getOrderForDispatchTx = async (client, orderId) => {
  const orderResult = await client.query(
    `
      SELECT
        o.id,
        o.status,
        o.driver_id AS "driverId",
        r.latitude AS "restaurantLatitude",
        r.longitude AS "restaurantLongitude"
      FROM buke.orders o
      JOIN buke.restaurants r ON r.id = o.restaurant_id
      WHERE o.id = $1
      FOR UPDATE
    `,
    [orderId]
  );

  if (orderResult.rowCount === 0) {
    throw new NotFoundError("Order not found");
  }

  return orderResult.rows[0];
};

const getEligibleDriversTx = async (client, restaurant) => {
  const result = await client.query(
    `
      SELECT
        id,
        current_latitude AS "latitude",
        current_longitude AS "longitude",
        last_seen_at AS "lastSeenAt"
      FROM buke.drivers
      WHERE is_active = true
        AND status = 'available'
        AND current_latitude IS NOT NULL
        AND current_longitude IS NOT NULL
        AND last_seen_at IS NOT NULL
        AND last_seen_at >= now() - make_interval(secs => $1)
    `,
    [config.dispatchDriverFreshnessSeconds]
  );

  return result.rows
    .map((driver) => ({
      ...driver,
      distanceM: Math.round(
        haversineMeters(
          {
            latitude: restaurant.restaurantLatitude,
            longitude: restaurant.restaurantLongitude
          },
          {
            latitude: Number(driver.latitude),
            longitude: Number(driver.longitude)
          }
        )
      )
    }))
    .filter((driver) => driver.distanceM <= config.dispatchMaxDistanceM)
    .sort((left, right) => left.distanceM - right.distanceM);
};

export const dispatchAcceptedOrderTx = async (client, orderId) => {
  await expirePendingOffersTx(client, orderId);

  const order = await getOrderForDispatchTx(client, orderId);

  if (order.driverId) {
    return {
      outcome: "already_assigned",
      driverId: order.driverId
    };
  }

  if (order.status !== "restaurant_accepted") {
    throw new ConflictError("Dispatch can only run for restaurant_accepted orders");
  }

  const pendingOfferResult = await client.query(
    `
      SELECT
        id,
        driver_id AS "driverId",
        distance_m AS "distanceM",
        expires_at AS "expiresAt"
      FROM buke.delivery_offers
      WHERE order_id = $1
        AND status = 'pending'
      LIMIT 1
    `,
    [orderId]
  );

  if (pendingOfferResult.rowCount > 0) {
    const pendingOffer = pendingOfferResult.rows[0];
    return {
      outcome: "offer_pending",
      offerId: pendingOffer.id,
      driverId: pendingOffer.driverId,
      distanceM: pendingOffer.distanceM,
      expiresAt: pendingOffer.expiresAt
    };
  }

  const eligibleDrivers = await getEligibleDriversTx(client, order);

  if (eligibleDrivers.length === 0) {
    return {
      outcome: "no_available_drivers",
      consideredDriverCount: 0,
      maxDistanceM: config.dispatchMaxDistanceM
    };
  }

  const selectedDriver = eligibleDrivers[0];
  const offerRankResult = await client.query(
    `
      SELECT COALESCE(MAX(offer_rank), 0) + 1 AS "offerRank"
      FROM buke.delivery_offers
      WHERE order_id = $1
    `,
    [orderId]
  );

  const expiresAt = new Date(Date.now() + config.dispatchOfferTtlSeconds * 1000);
  const offerRank = Number(offerRankResult.rows[0].offerRank);

  const offerResult = await client.query(
    `
      INSERT INTO buke.delivery_offers (
        order_id,
        driver_id,
        status,
        distance_m,
        offer_rank,
        expires_at
      )
      VALUES ($1, $2, 'pending', $3, $4, $5)
      RETURNING
        id,
        driver_id AS "driverId",
        distance_m AS "distanceM",
        offer_rank AS "offerRank",
        expires_at AS "expiresAt"
    `,
    [orderId, selectedDriver.id, selectedDriver.distanceM, offerRank, expiresAt]
  );

  await client.query(
    `
      UPDATE buke.drivers
      SET status = 'offered_delivery'
      WHERE id = $1
    `,
    [selectedDriver.id]
  );

  const offer = offerResult.rows[0];

  return {
    outcome: "offer_sent",
    offerId: offer.id,
    driverId: offer.driverId,
    distanceM: offer.distanceM,
    offerRank: offer.offerRank,
    expiresAt: offer.expiresAt
  };
};

export const acceptDeliveryOfferTx = async (client, { driverId, orderId }) => {
  await expirePendingOffersTx(client, orderId);

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
    throw new ConflictError("Driver does not exist or is inactive");
  }

  const driver = driverResult.rows[0];

  if (driver.status !== "offered_delivery") {
    throw new ConflictError("Driver must be in offered_delivery state to accept");
  }

  const order = await getOrderForDispatchTx(client, orderId);

  if (order.status !== "restaurant_accepted") {
    throw new ConflictError("Only restaurant_accepted orders can be accepted by a driver");
  }

  if (order.driverId && order.driverId !== driverId) {
    throw new ConflictError("Order is already assigned to another driver");
  }

  const offerResult = await client.query(
    `
      SELECT id
      FROM buke.delivery_offers
      WHERE order_id = $1
        AND driver_id = $2
        AND status = 'pending'
        AND expires_at > now()
      FOR UPDATE
    `,
    [orderId, driverId]
  );

  if (offerResult.rowCount === 0) {
    throw new ConflictError("No active delivery offer exists for this driver and order");
  }

  const offerId = offerResult.rows[0].id;

  await client.query(
    `
      UPDATE buke.delivery_offers
      SET status = 'accepted',
          responded_at = now()
      WHERE id = $1
    `,
    [offerId]
  );

  await cancelPendingOffersTx(client, orderId, driverId);

  await client.query(
    `
      UPDATE buke.orders
      SET driver_id = $2,
          status = 'driver_assigned'
      WHERE id = $1
    `,
    [orderId, driverId]
  );

  await client.query(
    `
      UPDATE buke.drivers
      SET status = 'delivering'
      WHERE id = $1
    `,
    [driverId]
  );

  await enqueueOrderNotificationsTx(client, {
    eventType: "driver_assigned",
    orderId
  });

  return {
    orderId,
    driverId,
    offerId,
    outcome: "driver_assigned"
  };
};
