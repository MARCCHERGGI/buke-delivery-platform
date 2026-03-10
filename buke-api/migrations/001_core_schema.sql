CREATE SCHEMA IF NOT EXISTS buke;
SET search_path = buke, public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'created',
      'restaurant_accepted',
      'driver_assigned',
      'driver_arriving',
      'picked_up',
      'delivered',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'driver_status') THEN
    CREATE TYPE driver_status AS ENUM (
      'offline',
      'idle',
      'on_order',
      'paused'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
    CREATE TYPE vehicle_type AS ENUM (
      'bike',
      'scooter',
      'car',
      'foot'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_actor_kind') THEN
    CREATE TYPE event_actor_kind AS ENUM (
      'system',
      'customer',
      'restaurant',
      'driver',
      'ops'
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION buke.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS buke.users (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                citext UNIQUE,
  phone_e164           text UNIQUE,
  full_name            text NOT NULL,
  is_active            boolean NOT NULL DEFAULT true,
  default_address_text text,
  default_latitude     numeric(9,6),
  default_longitude    numeric(9,6),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_contact_required
    CHECK (email IS NOT NULL OR phone_e164 IS NOT NULL),
  CONSTRAINT users_default_lat_range
    CHECK (default_latitude IS NULL OR default_latitude BETWEEN -90 AND 90),
  CONSTRAINT users_default_lng_range
    CHECK (default_longitude IS NULL OR default_longitude BETWEEN -180 AND 180)
);

CREATE TABLE IF NOT EXISTS buke.restaurants (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  slug               text NOT NULL UNIQUE,
  cuisine_type       text NOT NULL,
  phone_e164         text,
  address_text       text NOT NULL,
  latitude           numeric(9,6) NOT NULL,
  longitude          numeric(9,6) NOT NULL,
  delivery_radius_m  integer NOT NULL DEFAULT 3000,
  prep_time_minutes  smallint NOT NULL DEFAULT 20,
  is_open            boolean NOT NULL DEFAULT false,
  is_active          boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT restaurants_lat_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT restaurants_lng_range CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT restaurants_delivery_radius_positive CHECK (delivery_radius_m > 0),
  CONSTRAINT restaurants_prep_time_positive CHECK (prep_time_minutes > 0)
);

CREATE TABLE IF NOT EXISTS buke.menu_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    uuid NOT NULL REFERENCES buke.restaurants(id) ON DELETE RESTRICT,
  name             text NOT NULL,
  description      text,
  category         text NOT NULL,
  price_amount_all integer NOT NULL,
  currency_code    char(3) NOT NULL DEFAULT 'ALL',
  is_available     boolean NOT NULL DEFAULT true,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT menu_items_price_non_negative CHECK (price_amount_all >= 0),
  CONSTRAINT menu_items_currency_all CHECK (currency_code = 'ALL')
);

CREATE TABLE IF NOT EXISTS buke.drivers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL UNIQUE REFERENCES buke.users(id) ON DELETE RESTRICT,
  phone_e164        text UNIQUE,
  vehicle_type      vehicle_type NOT NULL,
  status            driver_status NOT NULL DEFAULT 'offline',
  is_active         boolean NOT NULL DEFAULT true,
  current_latitude  numeric(9,6),
  current_longitude numeric(9,6),
  last_seen_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT drivers_lat_range
    CHECK (current_latitude IS NULL OR current_latitude BETWEEN -90 AND 90),
  CONSTRAINT drivers_lng_range
    CHECK (current_longitude IS NULL OR current_longitude BETWEEN -180 AND 180)
);

CREATE TABLE IF NOT EXISTS buke.orders (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES buke.users(id) ON DELETE RESTRICT,
  restaurant_id          uuid NOT NULL REFERENCES buke.restaurants(id) ON DELETE RESTRICT,
  driver_id              uuid REFERENCES buke.drivers(id) ON DELETE RESTRICT,
  status                 order_status NOT NULL DEFAULT 'created',
  customer_address_text  text NOT NULL,
  customer_latitude      numeric(9,6) NOT NULL,
  customer_longitude     numeric(9,6) NOT NULL,
  customer_note          text,
  subtotal_amount_all    integer NOT NULL,
  delivery_fee_all       integer NOT NULL DEFAULT 0,
  service_fee_all        integer NOT NULL DEFAULT 0,
  discount_amount_all    integer NOT NULL DEFAULT 0,
  total_amount_all       integer GENERATED ALWAYS AS (
                           subtotal_amount_all
                           + delivery_fee_all
                           + service_fee_all
                           - discount_amount_all
                         ) STORED,
  placed_at              timestamptz NOT NULL DEFAULT now(),
  restaurant_accepted_at timestamptz,
  driver_assigned_at     timestamptz,
  driver_arriving_at     timestamptz,
  picked_up_at           timestamptz,
  delivered_at           timestamptz,
  cancelled_at           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT orders_customer_lat_range CHECK (customer_latitude BETWEEN -90 AND 90),
  CONSTRAINT orders_customer_lng_range CHECK (customer_longitude BETWEEN -180 AND 180),
  CONSTRAINT orders_amounts_non_negative CHECK (
    subtotal_amount_all >= 0
    AND delivery_fee_all >= 0
    AND service_fee_all >= 0
    AND discount_amount_all >= 0
    AND subtotal_amount_all + delivery_fee_all + service_fee_all - discount_amount_all >= 0
  ),
  CONSTRAINT orders_driver_required_for_driver_states CHECK (
    status NOT IN ('driver_assigned', 'driver_arriving', 'picked_up', 'delivered')
    OR driver_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS buke.driver_locations (
  id              bigserial PRIMARY KEY,
  driver_id       uuid NOT NULL REFERENCES buke.drivers(id) ON DELETE CASCADE,
  order_id        uuid REFERENCES buke.orders(id) ON DELETE SET NULL,
  latitude        numeric(9,6) NOT NULL,
  longitude       numeric(9,6) NOT NULL,
  heading_degrees numeric(5,2),
  speed_mps       numeric(6,2),
  accuracy_meters numeric(6,2),
  recorded_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT driver_locations_lat_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT driver_locations_lng_range CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT driver_locations_heading_range CHECK (
    heading_degrees IS NULL OR (heading_degrees >= 0 AND heading_degrees < 360)
  ),
  CONSTRAINT driver_locations_speed_non_negative CHECK (
    speed_mps IS NULL OR speed_mps >= 0
  ),
  CONSTRAINT driver_locations_accuracy_non_negative CHECK (
    accuracy_meters IS NULL OR accuracy_meters >= 0
  )
);

CREATE TABLE IF NOT EXISTS buke.order_events (
  id              bigserial PRIMARY KEY,
  order_id        uuid NOT NULL REFERENCES buke.orders(id) ON DELETE CASCADE,
  event_type      order_status NOT NULL,
  actor_kind      event_actor_kind NOT NULL DEFAULT 'system',
  actor_user_id   uuid REFERENCES buke.users(id) ON DELETE SET NULL,
  actor_driver_id uuid REFERENCES buke.drivers(id) ON DELETE SET NULL,
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at     timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON buke.users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON buke.users
FOR EACH ROW
EXECUTE FUNCTION buke.set_updated_at();

DROP TRIGGER IF EXISTS trg_restaurants_set_updated_at ON buke.restaurants;
CREATE TRIGGER trg_restaurants_set_updated_at
BEFORE UPDATE ON buke.restaurants
FOR EACH ROW
EXECUTE FUNCTION buke.set_updated_at();

DROP TRIGGER IF EXISTS trg_menu_items_set_updated_at ON buke.menu_items;
CREATE TRIGGER trg_menu_items_set_updated_at
BEFORE UPDATE ON buke.menu_items
FOR EACH ROW
EXECUTE FUNCTION buke.set_updated_at();

DROP TRIGGER IF EXISTS trg_drivers_set_updated_at ON buke.drivers;
CREATE TRIGGER trg_drivers_set_updated_at
BEFORE UPDATE ON buke.drivers
FOR EACH ROW
EXECUTE FUNCTION buke.set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_set_updated_at ON buke.orders;
CREATE TRIGGER trg_orders_set_updated_at
BEFORE UPDATE ON buke.orders
FOR EACH ROW
EXECUTE FUNCTION buke.set_updated_at();

CREATE OR REPLACE FUNCTION buke.enforce_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'created' THEN
      RAISE EXCEPTION 'new orders must start in created state';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  CASE OLD.status
    WHEN 'created' THEN
      IF NEW.status NOT IN ('restaurant_accepted', 'cancelled') THEN
        RAISE EXCEPTION 'invalid transition from % to %', OLD.status, NEW.status;
      END IF;
    WHEN 'restaurant_accepted' THEN
      IF NEW.status NOT IN ('driver_assigned', 'cancelled') THEN
        RAISE EXCEPTION 'invalid transition from % to %', OLD.status, NEW.status;
      END IF;
    WHEN 'driver_assigned' THEN
      IF NEW.status NOT IN ('driver_arriving', 'cancelled') THEN
        RAISE EXCEPTION 'invalid transition from % to %', OLD.status, NEW.status;
      END IF;
    WHEN 'driver_arriving' THEN
      IF NEW.status NOT IN ('picked_up', 'cancelled') THEN
        RAISE EXCEPTION 'invalid transition from % to %', OLD.status, NEW.status;
      END IF;
    WHEN 'picked_up' THEN
      IF NEW.status NOT IN ('delivered', 'cancelled') THEN
        RAISE EXCEPTION 'invalid transition from % to %', OLD.status, NEW.status;
      END IF;
    WHEN 'delivered', 'cancelled' THEN
      RAISE EXCEPTION 'terminal state % cannot transition to %', OLD.status, NEW.status;
    ELSE
      RAISE EXCEPTION 'unknown prior status %', OLD.status;
  END CASE;

  IF NEW.status IN ('driver_assigned', 'driver_arriving', 'picked_up', 'delivered')
     AND NEW.driver_id IS NULL THEN
    RAISE EXCEPTION 'driver_id is required for status %', NEW.status;
  END IF;

  IF NEW.status = 'restaurant_accepted' AND NEW.restaurant_accepted_at IS NULL THEN
    NEW.restaurant_accepted_at := now();
  END IF;

  IF NEW.status = 'driver_assigned' AND NEW.driver_assigned_at IS NULL THEN
    NEW.driver_assigned_at := now();
  END IF;

  IF NEW.status = 'driver_arriving' AND NEW.driver_arriving_at IS NULL THEN
    NEW.driver_arriving_at := now();
  END IF;

  IF NEW.status = 'picked_up' AND NEW.picked_up_at IS NULL THEN
    NEW.picked_up_at := now();
  END IF;

  IF NEW.status = 'delivered' AND NEW.delivered_at IS NULL THEN
    NEW.delivered_at := now();
  END IF;

  IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_enforce_status_transition ON buke.orders;
CREATE TRIGGER trg_orders_enforce_status_transition
BEFORE INSERT OR UPDATE OF status ON buke.orders
FOR EACH ROW
EXECUTE FUNCTION buke.enforce_order_status_transition();

CREATE OR REPLACE FUNCTION buke.log_order_status_event()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO buke.order_events (
    order_id,
    event_type,
    actor_kind,
    payload,
    occurred_at
  )
  VALUES (
    NEW.id,
    NEW.status,
    'system',
    CASE
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('to_status', NEW.status)
      ELSE jsonb_build_object('from_status', OLD.status, 'to_status', NEW.status)
    END,
    now()
  );

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_log_status_event_insert ON buke.orders;
CREATE TRIGGER trg_orders_log_status_event_insert
AFTER INSERT ON buke.orders
FOR EACH ROW
EXECUTE FUNCTION buke.log_order_status_event();

DROP TRIGGER IF EXISTS trg_orders_log_status_event_update ON buke.orders;
CREATE TRIGGER trg_orders_log_status_event_update
AFTER UPDATE OF status ON buke.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION buke.log_order_status_event();

CREATE INDEX IF NOT EXISTS idx_restaurants_open_active
  ON buke.restaurants (is_open, is_active);

CREATE INDEX IF NOT EXISTS idx_restaurants_location
  ON buke.restaurants (latitude, longitude);

CREATE UNIQUE INDEX IF NOT EXISTS ux_menu_items_restaurant_name_ci
  ON buke.menu_items (restaurant_id, lower(name));

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available_sort
  ON buke.menu_items (restaurant_id, is_available, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_drivers_status_active
  ON buke.drivers (status, is_active);

CREATE INDEX IF NOT EXISTS idx_drivers_last_seen_at
  ON buke.drivers (last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_created_at
  ON buke.orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_active
  ON buke.orders (restaurant_id, status, created_at DESC)
  WHERE status IN ('created', 'restaurant_accepted', 'driver_assigned', 'driver_arriving', 'picked_up');

CREATE INDEX IF NOT EXISTS idx_orders_driver_active
  ON buke.orders (driver_id, status, created_at DESC)
  WHERE driver_id IS NOT NULL
    AND status IN ('driver_assigned', 'driver_arriving', 'picked_up');

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON buke.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_recorded_at
  ON buke.driver_locations (driver_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_driver_locations_order_recorded_at
  ON buke.driver_locations (order_id, recorded_at DESC)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS brin_driver_locations_recorded_at
  ON buke.driver_locations
  USING brin (recorded_at);

CREATE INDEX IF NOT EXISTS idx_order_events_order_occurred_at
  ON buke.order_events (order_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_events_type_occurred_at
  ON buke.order_events (event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_events_payload_gin
  ON buke.order_events
  USING gin (payload);
