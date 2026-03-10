import { Router } from "express";

import { asyncHandler } from "../middleware/async-handler.js";
import { validate } from "../middleware/validate.js";
import {
  createOrderSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema
} from "../validation/schemas.js";
import {
  createOrder,
  getOrderById,
  updateOrderStatus
} from "../services/orders-service.js";

export const ordersRouter = Router();

ordersRouter.post(
  "/",
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    const order = await createOrder(req.body);
    res.status(201).json({ data: order });
  })
);

ordersRouter.get(
  "/:id",
  validate(orderIdParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const order = await getOrderById(req.params.id);
    res.json({ data: order });
  })
);

ordersRouter.patch(
  "/:id/status",
  validate(orderIdParamsSchema, "params"),
  validate(updateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    const order = await updateOrderStatus(req.params.id, req.body);
    res.json({ data: order });
  })
);
