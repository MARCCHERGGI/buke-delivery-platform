CREATE SCHEMA IF NOT EXISTS buke;
SET search_path = buke, public;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_offer_status') THEN
    CREATE TYPE delivery_offer_status AS ENUM (
      'pending',
      'accepted',
      'rejected',
      'expired',
      'cancelled'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_status')
     AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_status_v2') THEN
    CREATE TYPE driver_status_v2 AS ENUM (
      'offline',
      'available',
      'offered_delivery',
      'delivering'
    );
  END IF;
END $$;

ALTER TABLE buke.drivers
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE buke.drivers
  ALTER COLUMN status TYPE driver_status_v2
  USING (
    CASE status::text
      WHEN 'offline' THEN 'offline'
      WHEN 'idle' THEN 'available'
      WHEN 'available' THEN 'available'
      WHEN 'offered_delivery' THEN 'offered_delivery'
      WHEN 'on_order' THEN 'delivering'
      WHEN 'delivering' THEN 'delivering'
      WHEN 'paused' THEN 'offline'
      ELSE 'offline'
    END
  )::driver_status_v2;

DROP TYPE driver_status;
ALTER TYPE driver_status_v2 RENAME TO driver_status;

ALTER TABLE buke.drivers
  ALTER COLUMN status SET DEFAULT 'offline';

CREATE TABLE IF NOT EXISTS buke.delivery_offers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES buke.orders(id) ON DELETE CASCADE,
  driver_id   uuid NOT NULL REFERENCES buke.drivers(id) ON DELETE CASCADE,
  status      delivery_offer_status NOT NULL DEFAULT 'pending',
  distance_m  integer NOT NULL,
  offer_rank  integer NOT NULL,
  offered_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  responded_at timestamptz,
  CONSTRAINT delivery_offers_distance_non_negative CHECK (distance_m >= 0),
  CONSTRAINT delivery_offers_offer_rank_positive CHECK (offer_rank > 0),
  CONSTRAINT delivery_offers_expiry_after_offer CHECK (expires_at > offered_at)
);

CREATE INDEX IF NOT EXISTS idx_delivery_offers_order_id
  ON buke.delivery_offers (order_id, offered_at DESC);

CREATE INDEX IF NOT EXISTS idx_delivery_offers_driver_id
  ON buke.delivery_offers (driver_id, offered_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS ux_delivery_offers_pending_order
  ON buke.delivery_offers (order_id)
  WHERE status = 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS ux_delivery_offers_pending_driver
  ON buke.delivery_offers (driver_id)
  WHERE status = 'pending';
