# Bukë API

Express + PostgreSQL backend for the Bukë food delivery platform.

## Run

1. Copy `.env.example` to `.env`.
2. Apply `migrations/001_core_schema.sql`.
3. Apply `migrations/002_order_items.sql`.
4. Apply `migrations/003_dispatch_engine.sql`.
5. Apply `migrations/004_notifications.sql`.
6. Install dependencies with `npm install`.
7. Start the API with `npm run start`.

## Dispatch behavior

- When an order moves to `restaurant_accepted`, the dispatch engine finds `available` drivers within `3 km`, sorts by distance, and creates a single active offer for the closest driver.
- Driver state model: `offline`, `available`, `offered_delivery`, `delivering`.
- `POST /driver/accept` only succeeds for a driver with an active pending offer.

## Notifications

- Notification events emitted automatically: `order_created`, `restaurant_accepted`, `driver_assigned`, `driver_arriving`, `order_delivered`.
- Notifications are stored in `buke.notifications` and can be queried by customer, restaurant, driver, or order.
- `PATCH /notifications/:id/read` marks an in-app notification as read.

## Endpoints

- `POST /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`
- `GET /restaurants`
- `GET /restaurants/:id/menu`
- `POST /driver/location`
- `POST /driver/accept`
- `GET /notifications`
- `PATCH /notifications/:id/read`
