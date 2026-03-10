DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_event') THEN
    CREATE TYPE notification_event AS ENUM (
      'order_created',
      'restaurant_accepted',
      'driver_assigned',
      'driver_arriving',
      'order_delivered'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_recipient_kind') THEN
    CREATE TYPE notification_recipient_kind AS ENUM (
      'customer',
      'restaurant',
      'driver'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM (
      'in_app',
      'push',
      'sms'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS buke.notifications (
  id                      bigserial PRIMARY KEY,
  order_id                uuid NOT NULL REFERENCES buke.orders(id) ON DELETE CASCADE,
  event_type              notification_event NOT NULL,
  recipient_kind          notification_recipient_kind NOT NULL,
  recipient_user_id       uuid REFERENCES buke.users(id) ON DELETE CASCADE,
  recipient_driver_id     uuid REFERENCES buke.drivers(id) ON DELETE CASCADE,
  recipient_restaurant_id uuid REFERENCES buke.restaurants(id) ON DELETE CASCADE,
  channel                 notification_channel NOT NULL DEFAULT 'in_app',
  title                   text NOT NULL,
  body                    text NOT NULL,
  payload                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at              timestamptz NOT NULL DEFAULT now(),
  read_at                 timestamptz,
  CONSTRAINT notifications_recipient_match CHECK (
    (
      recipient_kind = 'customer'
      AND recipient_user_id IS NOT NULL
      AND recipient_driver_id IS NULL
      AND recipient_restaurant_id IS NULL
    ) OR (
      recipient_kind = 'restaurant'
      AND recipient_user_id IS NULL
      AND recipient_driver_id IS NULL
      AND recipient_restaurant_id IS NOT NULL
    ) OR (
      recipient_kind = 'driver'
      AND recipient_user_id IS NULL
      AND recipient_driver_id IS NOT NULL
      AND recipient_restaurant_id IS NULL
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_user_event_channel
  ON buke.notifications (order_id, event_type, channel, recipient_user_id)
  WHERE recipient_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_driver_event_channel
  ON buke.notifications (order_id, event_type, channel, recipient_driver_id)
  WHERE recipient_driver_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_notifications_restaurant_event_channel
  ON buke.notifications (order_id, event_type, channel, recipient_restaurant_id)
  WHERE recipient_restaurant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
  ON buke.notifications (recipient_user_id, read_at, created_at DESC)
  WHERE recipient_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_driver_created_at
  ON buke.notifications (recipient_driver_id, read_at, created_at DESC)
  WHERE recipient_driver_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_restaurant_created_at
  ON buke.notifications (recipient_restaurant_id, read_at, created_at DESC)
  WHERE recipient_restaurant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_order_created_at
  ON buke.notifications (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_payload_gin
  ON buke.notifications
  USING gin (payload);
