function notFoundHandler(req, res, next) {
  const error = new Error(`Route ${req.method} ${req.originalUrl} was not found.`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (error?.name === "MulterError") {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Invalid upload request.",
    });
  }

  if (error?.code === "P2002") {
    const fields = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : error.meta?.target || "unique field";

    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${fields}.`,
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found.",
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error.",
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
