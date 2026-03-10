import express from "express";
import helmet from "helmet";

import { ordersRouter } from "./routes/orders.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import { driversRouter } from "./routes/drivers.js";
import { notificationsRouter } from "./routes/notifications.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ data: { status: "ok" } });
});

app.use("/orders", ordersRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/driver", driversRouter);
app.use("/notifications", notificationsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
