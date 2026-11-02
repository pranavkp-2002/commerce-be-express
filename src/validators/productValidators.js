const { z, objectId, requiredString } = require("./common");

const createProductSchema = z.object({
  name: requiredString("Name"),
  description: z.string().optional(),
  price: z
    .number({ error: "Price must be a number" })
    .min(0, "Price cannot be negative"),
  category: objectId("category ID"),
  stock: z
    .number({ error: "Stock must be a number" })
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),
});

const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

// Query strings arrive as text, so numeric fields are coerced
const listProductsQuery = z.object({
  search: z.string().trim().optional(),
  category: objectId("category ID").optional(),
  minPrice: z.coerce.number().min(0, "minPrice cannot be negative").optional(),
  maxPrice: z.coerce.number().min(0, "maxPrice cannot be negative").optional(),
  sort: z.enum(["price_asc", "price_desc", "newest"]).optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  listProductsQuery,
};
