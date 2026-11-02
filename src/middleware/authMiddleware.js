const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const authMiddleware = async (req, res, next) => {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    throw new AppError("No token provided", 401);
  }

  // Throws JsonWebTokenError / TokenExpiredError, handled by errorHandler.
  // Pin the algorithm so a token can't pick a different one.
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

  // Load the user so deleted accounts and role changes take effect immediately
  // instead of when the token expires
  const user = await User.findById(decoded.userId).select(
    "+passwordChangedAt role",
  );

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  // Tokens issued before the last password change are revoked
  if (
    user.passwordChangedAt &&
    decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
  ) {
    throw new AppError("Password was changed, please log in again", 401);
  }

  req.user = { userId: user._id.toString(), role: user.role };
  next();
};

module.exports = authMiddleware;
