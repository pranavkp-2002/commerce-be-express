const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// Map known library errors to AppError. Returns null for unexpected errors.
const normalizeError = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  // Malformed JSON body from express.json()
  if (err.type === "entity.parse.failed") {
    return new AppError("Invalid JSON in request body", 400);
  }

  // Mongoose: invalid ObjectId or type cast (e.g. /products/abc)
  if (err.name === "CastError") {
    return new AppError(`Invalid value for ${err.path}`, 400);
  }

  // Mongoose: schema validation failed
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return new AppError(messages.join(", "), 400);
  }

  // MongoDB: unique index violation
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return new AppError(
      field ? `${field} already exists` : "Duplicate value",
      409,
    );
  }

  if (err.name === "TokenExpiredError") {
    return new AppError("Token expired", 401);
  }

  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401);
  }

  // Other client errors raised by Express / body-parser (e.g. payload too large)
  if (err.expose && err.status >= 400 && err.status < 500) {
    return new AppError(err.message, err.status);
  }

  return null;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const appError = normalizeError(err);

  if (!appError) {
    console.error("Unhandled error:", err);
  }

  const body = {
    success: false,
    message: appError ? appError.message : "Something went wrong",
    ...appError?.details,
  };

  if (process.env.NODE_ENV === "development") {
    body.stack = err.stack;
  }

  return res.status(appError ? appError.statusCode : 500).json(body);
};

module.exports = { notFound, errorHandler };
