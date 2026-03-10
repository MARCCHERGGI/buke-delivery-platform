import { Router } from "express";

import { asyncHandler } from "../middleware/async-handler.js";
import { validate } from "../middleware/validate.js";
import {
  driverAcceptSchema,
  driverLocationSchema
} from "../validation/schemas.js";
import {
  acceptOrder,
  recordDriverLocation
} from "../services/drivers-service.js";

export const driversRouter = Router();

driversRouter.post(
  "/location",
  validate(driverLocationSchema),
  asyncHandler(async (req, res) => {
    const location = await recordDriverLocation(req.body);
    res.status(201).json({ data: location });
  })
);

driversRouter.post(
  "/accept",
  validate(driverAcceptSchema),
  asyncHandler(async (req, res) => {
    const acceptedOrder = await acceptOrder(req.body);
    res.json({ data: acceptedOrder });
  })
);
