const multer = require("multer");
const AppError = require("../utils/AppError");

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

// Files stay in memory and are streamed straight to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_IMAGES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(
        new AppError("Only JPEG, PNG, WEBP or AVIF images are allowed", 400),
      );
    }
    cb(null, true);
  },
});

// Accepts up to MAX_IMAGES files in the "images" form field
const uploadProductImages = upload.array("images", MAX_IMAGES);

module.exports = { uploadProductImages, MAX_IMAGES };
