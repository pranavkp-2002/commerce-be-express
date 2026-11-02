const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("../src/routes/authRoutes");
const productRoutes = require("../src/routes/productRoutes");
const categroyRoutes = require("../src/routes/categroyRoutes");
const cartRoutes = require("../src/routes/cartRoutes");
const orderRoutes = require("../src/routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
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

// Must be registered after all routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log("server is on ", PORT);
});
