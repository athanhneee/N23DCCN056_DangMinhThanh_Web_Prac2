function notFoundHandler(req, res, next) {
  const error = new Error(`Route ${req.method} ${req.originalUrl} was not found.`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}.`,
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value detected.",
    });
  }

  const statusCode = error.statusCode || error.status || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error.",
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
