const cloudinary = require("cloudinary").v2;

const REQUIRED_VARS = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing Cloudinary config: ${missing.join(", ")}`);
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PRODUCT_FOLDER = "ecomerse/products";

// Streams an in-memory file buffer (from multer) to Cloudinary
const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: PRODUCT_FOLDER, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });

const uploadImages = async (files = []) => {
  const results = await Promise.allSettled(
    files.map((file) => uploadImage(file.buffer)),
  );
  const uploaded = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => ({ url: r.value.secure_url, publicId: r.value.public_id }));

  // All-or-nothing: don't leave orphaned images behind on partial failure
  const failure = results.find((r) => r.status === "rejected");
  if (failure) {
    await deleteImages(uploaded.map((img) => img.publicId));
    throw failure.reason;
  }

  return uploaded;
};

// Best-effort cleanup; a failed delete shouldn't fail the request
const deleteImages = async (publicIds = []) => {
  await Promise.all(
    publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId).catch((err) => {
        console.error(`Cloudinary delete failed for ${publicId}:`, err.message);
      }),
    ),
  );
};

module.exports = { uploadImages, deleteImages };
