const { z, requiredString } = require("./common");

const registerSchema = z.object({
  name: requiredString("Name"),
  email: requiredString("Email").toLowerCase().pipe(z.email("Invalid email")),
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: requiredString("Email").toLowerCase(),
  password: requiredString("Password"),
});

const updateUserSchema = z
  .object({
    name: requiredString("Name").optional(),
    oldPassword: z.string().min(1).optional(),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .optional(),
  })
  .refine((data) => !data.oldPassword === !data.newPassword, {
    message: "Old password and new password are required",
    path: ["newPassword"],
  });

module.exports = { registerSchema, loginSchema, updateUserSchema };
