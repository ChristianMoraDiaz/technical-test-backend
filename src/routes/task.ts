import express from "express";
import {
  createTaskSchema,
  getTaskByIdSchema,
  updateTaskSchema,
} from "../schemas/taskSchema";
import {
  createTaskService,
  getTaskByIdService,
  gettAllTasksService,
  updateTaskService,
} from "../services/taskServices";

const router = express.Router();

router.get("/", gettAllTasksService);

router.get("/:id", getTaskByIdSchema, getTaskByIdService);

router.post("/", createTaskSchema, createTaskService);

router.put("/:id", updateTaskSchema, updateTaskService);

export default router;
