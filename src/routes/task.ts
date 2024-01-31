import express from "express";
import { createTaskSchema, getTaskByIdSchema } from "../schemas/taskSchema";
import {
  createTaskService,
  deleteTask,
  getTaskByIdService,
  gettAllTasksService,
  setCompletedTask,
} from "../services/taskServices";

const router = express.Router();

router.get("/", gettAllTasksService);

router.get("/:id", getTaskByIdSchema, getTaskByIdService);

router.post("/", createTaskSchema, createTaskService);

router.put("/completed/:id", setCompletedTask);

router.delete("/delete/:id", deleteTask);

export default router;
