import { body } from "express-validator";

export const registerSchema = [
  body("name")
    .isString()
    .notEmpty()
    .isLength({ max: 30 })
    .withMessage("Name must be at most 30 characters long"),
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .isEmail()
    .notEmpty(),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/
    )
    .withMessage(
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];
