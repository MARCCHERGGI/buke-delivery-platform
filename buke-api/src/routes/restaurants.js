import { Router } from "express";

import { asyncHandler } from "../middleware/async-handler.js";
import { validate } from "../middleware/validate.js";
import {
  restaurantIdParamsSchema,
  restaurantsQuerySchema
} from "../validation/schemas.js";
import {
  getRestaurantMenu,
  listRestaurants
} from "../services/restaurants-service.js";

export const restaurantsRouter = Router();

restaurantsRouter.get(
  "/",
  validate(restaurantsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const restaurants = await listRestaurants({
      includeClosed: req.query.includeClosed === "true"
    });
    res.json({ data: restaurants });
  })
);

restaurantsRouter.get(
  "/:id/menu",
  validate(restaurantIdParamsSchema, "params"),
  asyncHandler(async (req, res) => {
    const restaurant = await getRestaurantMenu(req.params.id);
    res.json({ data: restaurant });
  })
);
