CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS buke;

CREATE TABLE IF NOT EXISTS buke.order_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES buke.orders(id) ON DELETE CASCADE,
  menu_item_id        uuid NOT NULL REFERENCES buke.menu_items(id) ON DELETE RESTRICT,
  item_name_snapshot  text NOT NULL,
  quantity            integer NOT NULL,
  unit_price_all      integer NOT NULL,
  total_price_all     integer NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT order_items_unit_price_non_negative CHECK (unit_price_all >= 0),
  CONSTRAINT order_items_total_price_non_negative CHECK (total_price_all >= 0),
  CONSTRAINT order_items_total_matches_unit_price CHECK (total_price_all = unit_price_all * quantity)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON buke.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id
  ON buke.order_items (menu_item_id);
