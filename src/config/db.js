const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Building indexes on every boot blocks startup and loads the primary in
      // production; there, run `npm run db:sync-indexes` on deploy instead
      autoIndex: process.env.NODE_ENV !== "production",
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("DB error", error);
  }
};
module.exports = connectDB;
