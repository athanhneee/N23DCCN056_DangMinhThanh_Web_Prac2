const path = require("node:path");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const { ensureCloudinaryConfigured } = require("../lib/cloudinary");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPublicId(fileName, productId) {
  const baseName = path.parse(fileName || `product-${productId}`).name;
  const safeName = slugify(baseName) || `product-${productId}`;

  return `product-${productId}-${Date.now()}-${safeName}`;
}

function createUploadMiddleware() {
  const cloudinary = ensureCloudinaryConfigured();
  const maxFileSize = Number.parseInt(
    process.env.PRODUCT_IMAGE_MAX_SIZE_BYTES || "5242880",
    10,
  );

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: process.env.CLOUDINARY_PRODUCT_FOLDER || "products",
      resource_type: "image",
      public_id: buildPublicId(file.originalname, req.params.id),
    }),
  });

  return multer({
    storage,
    limits: {
      fileSize: Number.isFinite(maxFileSize) ? maxFileSize : 5242880,
    },
    fileFilter: (req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const error = new Error("Only image files (jpg, png, webp, gif) are allowed.");
        error.statusCode = 400;
        return callback(error);
      }

      return callback(null, true);
    },
  }).single("image");
}

function uploadProductImage(req, res, next) {
  try {
    const upload = createUploadMiddleware();

    upload(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
          error.statusCode = 400;
          error.message = "Image file is too large.";
        }

        return next(error);
      }

      if (!req.file) {
        const missingFileError = new Error("Image file is required.");
        missingFileError.statusCode = 400;
        return next(missingFileError);
      }

      return next();
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadProductImage,
};
