const isDatabaseConnectionError = (err) =>
  err?.name === "PrismaClientInitializationError" ||
  err?.message?.includes("Authentication failed against database server") ||
  err?.message?.includes("Can't reach database server");

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] AUTH ERROR:`, err);

  if (err.code === "P2002") {
    const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : "Du lieu";
    return res.status(409).json({
      success: false,
      message: `${fields} da ton tai`
    });
  }

  if (err.code === "P2022") {
    return res.status(500).json({
      success: false,
      message: "Schema database chua khop voi auth-service. Hay chay lai Prisma generate/push."
    });
  }

  if (isDatabaseConnectionError(err)) {
    return res.status(503).json({
      success: false,
      message: "Khong ket noi duoc co so du lieu. Hay kiem tra DATABASE_URL hoac trang thai database."
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Loi he thong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorHandler;
