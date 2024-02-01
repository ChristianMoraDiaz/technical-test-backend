"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTaskService = exports.deleteTaskService = exports.setCompletedTaskService = exports.createTaskService = exports.getTaskByIdService = exports.gettAllTasksService = void 0;
const express_validator_1 = require("express-validator");
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = __importDefault(require("../db"));
const logServices_1 = require("./logServices");
const gettAllTasksService = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield db_1.default.task.findMany({
            select: {
                id: true,
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                completed: true,
                creationDate: true,
                completedDate: true,
            },
        });
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.gettAllTasksService = gettAllTasksService;
const getTaskByIdService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const params = +req.params.id;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const response = yield db_1.default.task.findFirst({
            where: {
                id: params,
            },
            select: {
                id: true,
                title: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                completed: true,
                creationDate: true,
                completedDate: true,
            },
        });
        if (response) {
            return res.status(200).json(response);
        }
        return res.status(404).json({ error: "Task not found" });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getTaskByIdService = getTaskByIdService;
const createTaskService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { authorEmail, assignedUserId, completed, title } = req.body;
        const author = yield db_1.default.user.findUnique({
            where: {
                email: authorEmail,
            },
        });
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        const parsedAssignedUserId = parseInt(assignedUserId);
        const assignedUser = yield db_1.default.user.findUnique({
            where: {
                id: parsedAssignedUserId,
            },
        });
        if (!assignedUser) {
            return res
                .status(400)
                .json({ message: "Assigned user ID does not exist" });
        }
        const isCompleted = completed === "true" ? true : false;
        const createdTask = yield db_1.default.task.create({
            data: {
                title,
                authorId: author.id,
                assignedUserId: parsedAssignedUserId,
                completed: isCompleted,
            },
        });
        yield (0, logServices_1.createLog)(createdTask.id, author.id, "Task created");
        return res
            .status(201)
            .json({ message: "Task created successfully", task: createdTask });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error in the creation process" });
    }
});
exports.createTaskService = createTaskService;
function sendEmail(authorEmail, assigneduserEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let transporter = nodemailer_1.default.createTransport({
                host: "smtp.example.com",
                port: 587,
                secure: false,
                auth: {
                    user: "your_username",
                    pass: "your_password",
                },
            });
            let mailOptions = {
                from: `${assigneduserEmail}`,
                to: authorEmail,
                subject: "Task Completed",
                text: "Your task has been completed.",
            };
            let info = yield transporter.sendMail(mailOptions);
            console.log("Email sent: " + info.response);
        }
        catch (error) {
            console.error("Error sending email: ", error);
        }
    });
}
const setCompletedTaskService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const taskId = +req.params.id;
    const userEmail = req.body.userEmail;
    try {
        const existingTask = yield db_1.default.task.findFirst({
            where: {
                id: taskId,
            },
        });
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        const user = yield db_1.default.user.findFirst({
            where: {
                email: userEmail,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (existingTask.assignedUserId !== user.id) {
            return res
                .status(403)
                .json({ message: "You are not authorized to update this task" });
        }
        const updatedTask = yield db_1.default.task.update({
            where: {
                id: taskId,
            },
            data: Object.assign(Object.assign({}, existingTask), { completed: true, completedDate: new Date() }),
        });
        const author = yield db_1.default.user.findFirst({
            where: { id: existingTask.authorId },
        });
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        yield (0, logServices_1.createLog)(taskId, user.id, "Task completed");
        yield sendEmail(author.email, userEmail);
        return res.json(updatedTask);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error in the update process" });
    }
});
exports.setCompletedTaskService = setCompletedTaskService;
const deleteTaskService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = +req.params.id;
        const userEmail = req.body.userEmail;
        const user = yield db_1.default.user.findFirst({
            where: {
                email: userEmail,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const task = yield db_1.default.task.findFirst({
            where: {
                id: taskId,
            },
            select: {
                id: true,
                completed: true,
                author: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.author.email !== userEmail) {
            return res
                .status(403)
                .json({ message: "You are not authorized to delete this task" });
        }
        if (task.completed) {
            return res
                .status(403)
                .json({ message: "Cannot delete a completed task" });
        }
        yield db_1.default.task.delete({
            where: {
                id: taskId,
            },
        });
        yield (0, logServices_1.createLog)(taskId, user.id, "Task deleted");
        return res.status(204).send();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error in the delete process" });
    }
});
exports.deleteTaskService = deleteTaskService;
const editTaskService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const taskId = +req.params.id;
        const { userEmail, newAssignedUserId, title, completed } = req.body;
        const parsedNewAssignedUserId = parseInt(newAssignedUserId);
        const task = yield db_1.default.task.findFirst({
            where: {
                id: taskId,
            },
            select: {
                id: true,
                author: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.author.email !== userEmail) {
            return res
                .status(403)
                .json({ message: "You are not authorized to edit this task" });
        }
        const newAssignedUser = yield db_1.default.user.findUnique({
            where: {
                id: parsedNewAssignedUserId,
            },
        });
        if (!newAssignedUser) {
            return res
                .status(400)
                .json({ message: "New assigned user ID does not exist" });
        }
        const isCompleted = completed === "true" ? true : false;
        const dataToUpdate = {
            assignedUserId: parsedNewAssignedUserId,
            title,
            completed: isCompleted,
        };
        if (completed === false) {
            dataToUpdate.completedDate = null;
        }
        yield db_1.default.task.update({
            where: {
                id: taskId,
            },
            data: dataToUpdate,
        });
        const user = yield db_1.default.user.findFirst({
            where: {
                email: userEmail,
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        yield (0, logServices_1.createLog)(taskId, user.id, "Task edited");
        return res.status(200).json({ message: "Task updated successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error in the update process" });
    }
});
exports.editTaskService = editTaskService;
