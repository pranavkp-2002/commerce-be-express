const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");

const limiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next) => next(new AppError(message, 429)),
  });

// Applied to every /api request
const apiLimiter = limiter(
  15 * 60 * 1000,
  300,
  "Too many requests, please try again later",
);

// Stricter limit for login/register to slow down brute force and credential stuffing
const authLimiter = limiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts, please try again later",
);

module.exports = { apiLimiter, authLimiter };
