const AppError = require("../utils/AppError");

const SOURCES = ["params", "query", "body"];

// Validates req.params / req.query / req.body against Zod schemas and replaces
// them with the parsed values (trimmed, coerced, unknown keys stripped).
// Usage: validate({ params: idParam, body: createProductSchema })
const validate = (schemas) => (req, res, next) => {
  const errors = [];

  for (const source of SOURCES) {
    const schema = schemas[source];
    if (!schema) continue;

    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push({
          field: [source, ...issue.path].join("."),
          message: issue.message,
        });
      }
      continue;
    }

    // Express 5 exposes req.query as a getter, so it can't be assigned directly
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  if (errors.length > 0) {
    throw new AppError("Validation failed", 400, { errors });
  }

  next();
};

module.exports = validate;
