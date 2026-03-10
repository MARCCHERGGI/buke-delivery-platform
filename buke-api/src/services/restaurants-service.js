import { query, withTransaction } from "../db.js";
import { NotFoundError } from "../errors.js";

export const listRestaurants = async ({ includeClosed }) => {
  const result = await query(
    `
      SELECT
        id,
        name,
        slug,
        cuisine_type AS "cuisineType",
        address_text AS "addressText",
        latitude,
        longitude,
        delivery_radius_m AS "deliveryRadiusM",
        prep_time_minutes AS "prepTimeMinutes",
        is_open AS "isOpen",
        is_active AS "isActive"
      FROM buke.restaurants
      WHERE is_active = true
        AND ($1::boolean = true OR is_open = true)
      ORDER BY name ASC
    `,
    [includeClosed]
  );

  return result.rows;
};

export const getRestaurantMenu = async (restaurantId) =>
  withTransaction(async (client) => {
    const restaurantResult = await client.query(
      `
        SELECT
          id,
          name,
          slug,
          cuisine_type AS "cuisineType",
          address_text AS "addressText",
          is_open AS "isOpen",
          is_active AS "isActive"
        FROM buke.restaurants
        WHERE id = $1
      `,
      [restaurantId]
    );

    if (restaurantResult.rowCount === 0) {
      throw new NotFoundError("Restaurant not found");
    }

    const menuResult = await client.query(
      `
        SELECT
          id,
          name,
          description,
          category,
          price_amount_all AS "priceAmountAll",
          currency_code AS "currencyCode",
          is_available AS "isAvailable",
          sort_order AS "sortOrder"
        FROM buke.menu_items
        WHERE restaurant_id = $1
        ORDER BY category ASC, sort_order ASC, name ASC
      `,
      [restaurantId]
    );

    return {
      ...restaurantResult.rows[0],
      menu: menuResult.rows
    };
  });
