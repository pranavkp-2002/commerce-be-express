const { z } = require("zod");

const objectId = (label = "ID") =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const requiredString = (label) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

const idParam = z.object({ id: objectId() });

module.exports = { z, objectId, requiredString, idParam };
