import { z } from "zod";

const uuidSchema = z.string().uuid();

export const orderItemSchema = z.object({
  menuItemId: uuidSchema,
  quantity: z.number().int().positive()
});

export const createOrderSchema = z.object({
  userId: uuidSchema,
  restaurantId: uuidSchema,
  customerAddressText: z.string().trim().min(5).max(300),
  customerLatitude: z.number().min(-90).max(90),
  customerLongitude: z.number().min(-180).max(180),
  customerNote: z.string().trim().max(500).optional(),
  deliveryFeeAll: z.number().int().min(0).default(0),
  serviceFeeAll: z.number().int().min(0).default(0),
  discountAmountAll: z.number().int().min(0).default(0),
  items: z.array(orderItemSchema).min(1).max(50)
}).superRefine((value, ctx) => {
  const ids = value.items.map((item) => item.menuItemId);
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["items"],
      message: "Duplicate menuItemId values are not allowed"
    });
  }
});

export const orderIdParamsSchema = z.object({
  id: uuidSchema
});

export const restaurantIdParamsSchema = z.object({
  id: uuidSchema
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "created",
    "restaurant_accepted",
    "driver_assigned",
    "driver_arriving",
    "picked_up",
    "delivered",
    "cancelled"
  ]),
  driverId: uuidSchema.optional()
});

export const restaurantsQuerySchema = z.object({
  includeClosed: z.enum(["true", "false"]).optional().default("false")
});

export const driverLocationSchema = z.object({
  driverId: uuidSchema,
  orderId: uuidSchema.optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  headingDegrees: z.number().min(0).max(359.99).optional(),
  speedMps: z.number().min(0).optional(),
  accuracyMeters: z.number().min(0).optional(),
  recordedAt: z.string().datetime().optional()
});

export const driverAcceptSchema = z.object({
  driverId: uuidSchema,
  orderId: uuidSchema
});

export const notificationsQuerySchema = z.object({
  userId: uuidSchema.optional(),
  restaurantId: uuidSchema.optional(),
  driverId: uuidSchema.optional(),
  orderId: uuidSchema.optional(),
  unreadOnly: z.enum(["true", "false"]).optional().default("false"),
  limit: z.coerce.number().int().min(1).max(100).default(50)
}).superRefine((value, ctx) => {
  if (!value.userId && !value.restaurantId && !value.driverId && !value.orderId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "At least one of userId, restaurantId, driverId, or orderId is required"
    });
  }
});

export const notificationIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
