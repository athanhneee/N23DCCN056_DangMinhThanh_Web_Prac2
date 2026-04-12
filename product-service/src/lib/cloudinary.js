const { v2: cloudinary } = require("cloudinary");

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  const error = new Error(`${name} is not configured.`);
  error.statusCode = 500;
  throw error;
}

function ensureCloudinaryConfigured() {
  cloudinary.config({
    cloud_name: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnv("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  return cloudinary;
}

module.exports = {
  ensureCloudinaryConfigured,
};
