export class AppError extends Error {
  constructor(message, { statusCode = 500, code = "internal_error", details = null } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message, details = null) {
    super(message, { statusCode: 400, code: "bad_request", details });
  }
}

export class NotFoundError extends AppError {
  constructor(message, details = null) {
    super(message, { statusCode: 404, code: "not_found", details });
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, { statusCode: 409, code: "conflict", details });
  }
}
