import { BadRequestError } from "../errors.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const parsed = schema.safeParse(req[source]);

  if (!parsed.success) {
    next(
      new BadRequestError("Validation failed", {
        source,
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      })
    );
    return;
  }

  req[source] = parsed.data;
  next();
};
