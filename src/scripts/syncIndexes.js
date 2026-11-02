// Brings the database's indexes in line with the schema definitions: creates
// missing ones and drops ones no longer declared (e.g. the old orders user_1).
// Usage: npm run db:sync-indexes
require("dotenv").config();

const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const models = [Cart, Category, Order, Product, User];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { autoIndex: false });

  for (const model of models) {
    const dropped = await model.syncIndexes();
    const indexes = await model.listIndexes();
    console.log(
      `${model.modelName}: ${indexes.map((index) => index.name).join(", ")}` +
        (dropped.length > 0 ? ` (dropped: ${dropped.join(", ")})` : ""),
    );
  }
};

run()
  .catch((error) => {
    console.error("Index sync failed", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
