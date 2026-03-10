import { Router } from "express";

import { asyncHandler } from "../middleware/async-handler.js";
import { validate } from "../middleware/validate.js";
import {
  notificationIdParamsSchema,
  notificationsQuerySchema
} from "../validation/schemas.js";
import {
  listNotifications,
  markNotificationRead
} from "../services/notifications-service.js";

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  validate(notificationsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const notifications = await listNotifications({
      ...req.query,
      unreadOnly: req.query.unreadOnly === "true"
    });

    res.json({ data: notifications });
  })
);

notificationsRouter.patch(
  "/:id/read",
  validate(notificationIdParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const notification = await markNotificationRead(req.params.id);
    res.json({ data: notification });
  })
);
