const { verifyAccessToken } = require("../utils/tokens");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Chưa đăng nhập"
    });
  }

  
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn"
    });
  }
};

module.exports = { authenticate };
