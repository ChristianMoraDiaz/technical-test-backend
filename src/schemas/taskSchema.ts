import { body, param } from "express-validator";

export const createTaskSchema = [
  body("title").isString().notEmpty(),
  body("authorId")
    .isInt()
    .withMessage("WeatherId must be an integer")
    .notEmpty(),
  body("assignedUserId")
    .isInt()
    .withMessage("VisibilityId must be an integer")
    .notEmpty(),
  body("completed").isBoolean(),
  body("completedDate").optional().isISO8601().toDate(),
];

export const getTaskByIdSchema = [
  param("id").isInt().withMessage("Id must be an integer").notEmpty(),
];

export const updateTaskSchema = [
  param("id").isInt().withMessage("Id must be an integer").notEmpty(),
  body("title").isString().notEmpty(),
  body("authorId")
    .isInt()
    .withMessage("WeatherId must be an integer")
    .notEmpty(),
  body("assignedUserId")
    .isInt()
    .withMessage("VisibilityId must be an integer")
    .notEmpty(),
  body("completed").isBoolean(),
  body("completedDate").optional().isISO8601().toDate(),
];
