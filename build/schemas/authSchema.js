"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const express_validator_1 = require("express-validator");
exports.registerSchema = [
    (0, express_validator_1.body)("name")
        .isString()
        .notEmpty()
        .isLength({ max: 30 })
        .withMessage("Name must be at most 30 characters long"),
    (0, express_validator_1.body)("email")
        .isString()
        .withMessage("Email must be a string")
        .isEmail()
        .notEmpty(),
    (0, express_validator_1.body)("password")
        .isString()
        .withMessage("Password must be a string")
        .notEmpty()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/)
        .withMessage("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"),
];
