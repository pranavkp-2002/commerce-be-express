const { z, objectId, requiredString } = require("./common");
const { ORDER_STATUSES } = require("../models/Order");

const checkoutSchema = z.object({
  shippingAddress: z.object(
    {
      street: requiredString("Street"),
      city: requiredString("City"),
      state: requiredString("State"),
      postalCode: requiredString("Postal code"),
      country: requiredString("Country"),
    },
    { error: "Shipping address is required" },
  ),
});

const orderIdParam = z.object({ orderId: objectId("order ID") });

const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, { error: "Invalid order status" }),
});

module.exports = { checkoutSchema, orderIdParam, updateOrderStatusSchema };
