import { AppError } from "../errors.js";
import { config } from "../config.js";

const mapDatabaseError = (error) => {
  if (error.code === "23503") {
    return new AppError("Related record does not exist", {
      statusCode: 400,
      code: "foreign_key_violation"
    });
  }

  if (error.code === "23505") {
    return new AppError("Record already exists", {
      statusCode: 409,
      code: "unique_violation"
    });
  }

  if (error.code === "23514") {
    return new AppError("Database constraint rejected the request", {
      statusCode: 400,
      code: "check_violation"
    });
  }

  if (error.code === "22P02") {
    return new AppError("Invalid value format", {
      statusCode: 400,
      code: "invalid_text_representation"
    });
  }

  if (error.code === "P0001") {
    return new AppError(error.message, {
      statusCode: 409,
      code: "invalid_state_transition"
    });
  }

  return null;
};

export const errorHandler = (error, _req, res, _next) => {
  const mappedDatabaseError = mapDatabaseError(error);
  const normalizedError = mappedDatabaseError ?? (error instanceof AppError ? error : null);

  if (!normalizedError) {
    console.error(error);
  }

  const statusCode = normalizedError?.statusCode ?? 500;
  const response = {
    error: {
      code: normalizedError?.code ?? "internal_error",
      message: normalizedError?.message ?? "Internal server error"
    }
  };

  if (normalizedError?.details) {
    response.error.details = normalizedError.details;
  }

  if (!normalizedError && config.nodeEnv !== "production") {
    response.error.details = {
      message: error.message,
      stack: error.stack
    };
  }

  res.status(statusCode).json(response);
};
