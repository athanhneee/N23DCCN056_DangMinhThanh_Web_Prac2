const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg
      }))
    });
  }

  next();
};


const registerValidation = [
  body("fullName")
    .trim()
    .notEmpty().withMessage("Họ tên không được rỗng")
    .isLength({ min: 2, max: 100 }).withMessage("Họ tên phải từ 2-100 ký tự"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email không được rỗng")
    .isEmail().withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Mật khẩu không được rỗng")
    .isLength({ min: 6 }).withMessage("Mật khẩu tối thiểu 6 ký tự"),

  handleValidation
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email không được rỗng")
    .isEmail().withMessage("Email không hợp lệ")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Mật khẩu không được rỗng"),

  handleValidation
];

const refreshValidation = [
  body("refreshToken")
    .trim()
    .notEmpty().withMessage("refreshToken không được rỗng"),

  handleValidation
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation
};
