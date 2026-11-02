const { z, requiredString } = require("./common");

const createCategorySchema = z.object({
  name: requiredString("Category name"),
  description: z.string().trim().optional(),
});

const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

module.exports = { createCategorySchema, updateCategorySchema };
