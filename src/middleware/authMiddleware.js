const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  // Throws JsonWebTokenError / TokenExpiredError, handled by errorHandler
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
};

module.exports = authMiddleware;
