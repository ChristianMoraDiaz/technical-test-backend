import express from "express";
import { getTaskByIdSchema } from "../schemas/taskSchema";
import {
  createTaskService,
  deleteTaskService,
  editTaskService,
  getTaskByIdService,
  gettAllTasksService,
  setCompletedTaskService,
} from "../services/taskServices";

const router = express.Router();

router.get("/", gettAllTasksService);

router.get("/:id", getTaskByIdSchema, getTaskByIdService);

router.post("/", createTaskService);

router.put("/edit/:id", editTaskService);

router.put("/completed/:id", setCompletedTaskService);

router.delete("/delete/:id", deleteTaskService);

export default router;
