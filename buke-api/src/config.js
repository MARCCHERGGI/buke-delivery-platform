import dotenv from "dotenv";

dotenv.config();

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
};

const parsePort = (value) => {
  const parsed = Number.parseInt(value ?? "3000", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3000;
};

const parsePositiveInt = (value, defaultValue) => {
  const parsed = Number.parseInt(value ?? `${defaultValue}`, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  dbSsl: parseBoolean(process.env.DB_SSL),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379/0",
  dispatchMaxDistanceM: parsePositiveInt(process.env.DISPATCH_MAX_DISTANCE_M, 3000),
  dispatchOfferTtlSeconds: parsePositiveInt(process.env.DISPATCH_OFFER_TTL_SECONDS, 30),
  dispatchDriverFreshnessSeconds: parsePositiveInt(
    process.env.DISPATCH_DRIVER_FRESHNESS_SECONDS,
    300
  )
};
