// Load env before anything reads process.env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const authRouter = require("../src/routes/authRoutes");
const productRoutes = require("../src/routes/productRoutes");
const categroyRoutes = require("../src/routes/categroyRoutes");
const cartRoutes = require("../src/routes/cartRoutes");
const orderRoutes = require("../src/routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Fail fast instead of signing tokens with an undefined or guessable secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and at least 32 characters long");
  process.exit(1);
}

const app = express();

// Set when running behind a reverse proxy so rate limiting sees the client IP,
// e.g. TRUST_PROXY=1 for a single proxy hop
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY));
}

app.disable("x-powered-by");
app.use(helmet());

// Comma-separated allowlist, e.g. CORS_ORIGIN=https://shop.example.com.
// When unset, cross-origin browser requests are rejected.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: "10kb" }));
app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRoutes);
app.use("/api/categroy", categroyRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/", orderRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is ON",
  });
});

app.get("/api/db-status", (req, res) => {
  res.json({
    databaseState: mongoose.connection.readyState,
    connected: mongoose.connection.readyState === 1,
  });
});
// Must be registered after all routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log("server is on ", PORT);
});
