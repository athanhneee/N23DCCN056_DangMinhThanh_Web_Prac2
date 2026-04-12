const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { issueTokens, verifyRefreshToken } = require("../utils/tokens");

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});


const saveRefreshToken = async (userId, refreshToken) => {
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { hashedRefreshToken }
  });
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    });

    const tokens = issueTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: sanitizeUser(user),
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    const tokens = issueTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: sanitizeUser(user),
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "refreshToken không hợp lệ hoặc đã hết hạn"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) }
    });

    if (!user || !user.hashedRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "refreshToken không hợp lệ"
      });
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (!isRefreshTokenValid) {
      return res.status(401).json({
        success: false,
        message: "refreshToken không hợp lệ"
      });
    }

    const tokens = issueTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return res.json({
      success: true,
      message: "Cấp token mới thành công",
      data: {
        user: sanitizeUser(user),
        ...tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.sub) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng"
      });
    }

    return res.json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  me
};
