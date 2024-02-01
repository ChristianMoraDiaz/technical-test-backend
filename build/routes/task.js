"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskSchema_1 = require("../schemas/taskSchema");
const taskServices_1 = require("../services/taskServices");
const router = express_1.default.Router();
router.get("/", taskServices_1.gettAllTasksService);
router.get("/:id", taskSchema_1.getTaskByIdSchema, taskServices_1.getTaskByIdService);
router.post("/", taskServices_1.createTaskService);
router.put("/edit/:id", taskServices_1.editTaskService);
router.put("/completed/:id", taskServices_1.setCompletedTaskService);
router.delete("/delete/:id", taskServices_1.deleteTaskService);
exports.default = router;
