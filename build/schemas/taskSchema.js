"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.getTaskByIdSchema = exports.createTaskSchema = void 0;
const express_validator_1 = require("express-validator");
exports.createTaskSchema = [
    (0, express_validator_1.body)("title").isString().notEmpty(),
    (0, express_validator_1.body)("authorId")
        .isInt()
        .withMessage("WeatherId must be an integer")
        .notEmpty(),
    (0, express_validator_1.body)("assignedUserId")
        .isInt()
        .withMessage("VisibilityId must be an integer")
        .notEmpty(),
    (0, express_validator_1.body)("completed").isBoolean(),
    (0, express_validator_1.body)("completedDate").optional().isISO8601().toDate(),
];
exports.getTaskByIdSchema = [
    (0, express_validator_1.param)("id").isInt().withMessage("Id must be an integer").notEmpty(),
];
exports.updateTaskSchema = [
    (0, express_validator_1.param)("id").isInt().withMessage("Id must be an integer").notEmpty(),
    (0, express_validator_1.body)("title").isString().notEmpty(),
    (0, express_validator_1.body)("authorId")
        .isInt()
        .withMessage("WeatherId must be an integer")
        .notEmpty(),
    (0, express_validator_1.body)("assignedUserId")
        .isInt()
        .withMessage("VisibilityId must be an integer")
        .notEmpty(),
    (0, express_validator_1.body)("completed").isBoolean(),
    (0, express_validator_1.body)("completedDate").optional().isISO8601().toDate(),
];
