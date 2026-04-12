require("dotenv").config();

const jwt = require("jsonwebtoken");

const getJwtSecret = (envName, fallback) => {
  const secret =
    process.env[envName] ||
    (process.env.NODE_ENV !== "production" ? fallback : undefined);

  if (!secret) {
    throw new Error(`${envName} is not configured`);
  }

  return secret;
};

const ACCESS_TOKEN_SECRET = getJwtSecret("JWT_SECRET", "auth-service-local-access-secret");
const REFRESH_TOKEN_SECRET = getJwtSecret(
  "JWT_REFRESH_SECRET",
  "auth-service-local-refresh-secret"
);

const buildPayload = (user) => ({
  sub: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role
});

const signAccessToken = (user) =>
  jwt.sign(buildPayload(user), ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

const signRefreshToken = (user) =>
  jwt.sign(buildPayload(user), REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

const issueTokens = (user) => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user)
});

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_TOKEN_SECRET);

module.exports = {
  issueTokens,
  verifyAccessToken,
  verifyRefreshToken
};
