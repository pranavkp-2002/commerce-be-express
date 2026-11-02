const { z } = require("zod");

const objectId = (label = "ID") =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const requiredString = (label) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

const idParam = z.object({ id: objectId() });

// Query strings arrive as text, so page/limit are coerced. Spread into a list
// endpoint's query schema so every collection read is bounded.
const pagination = {
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
};

const paginationQuery = z.object(pagination);

module.exports = {
  z,
  objectId,
  requiredString,
  idParam,
  pagination,
  paginationQuery,
};
