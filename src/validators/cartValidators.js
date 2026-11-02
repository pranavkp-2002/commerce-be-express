const { z, objectId } = require("./common");

const quantity = z
  .number({ error: "Quantity must be a positive integer" })
  .int("Quantity must be a positive integer")
  .min(1, "Quantity must be a positive integer");

const addToCartSchema = z.object({
  product: objectId("product ID"),
  quantity,
});

const updateCartSchema = z.object({ quantity });

module.exports = { addToCartSchema, updateCartSchema };
