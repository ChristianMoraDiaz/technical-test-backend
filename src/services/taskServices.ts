import { Request, Response } from "express";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import prismaDB from "../db";
import { createLog } from "./logServices";

export const gettAllTasksService = async (_req: Request, res: Response) => {
  try {
    const response = await prismaDB.task.findMany({
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
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTaskByIdService = async (req: Request, res: Response) => {
  const params = +req.params.id;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const response = await prismaDB.task.findFirst({
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
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createTaskService = async (req: Request, res: Response) => {
  try {
    const { authorEmail, assignedUserId, completed, title } = req.body;

    const author = await prismaDB.user.findUnique({
      where: {
        email: authorEmail,
      },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    const parsedAssignedUserId = parseInt(assignedUserId);

    const assignedUser = await prismaDB.user.findUnique({
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

    const createdTask = await prismaDB.task.create({
      data: {
        title,
        authorId: author.id,
        assignedUserId: parsedAssignedUserId,
        completed: isCompleted,
      },
    });

    await createLog(createdTask.id, authorEmail, "Task created");

    return res
      .status(201)
      .json({ message: "Task created successfully", task: createdTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in the creation process" });
  }
};

async function sendEmail(authorEmail: string, assigneduserEmail: string) {
  try {
    let transporter = nodemailer.createTransport({
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

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

export const setCompletedTaskService = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const taskId = +req.params.id;
  const userEmail = req.body.userEmail;

  try {
    const existingTask = await prismaDB.task.findFirst({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userId = await prismaDB.user.findFirst({
      where: {
        email: userEmail,
      },
    });

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingTask.assignedUserId !== userId.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this task" });
    }

    const updatedTask = await prismaDB.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...existingTask,
        completed: true,
        completedDate: new Date(),
      },
    });

    const author = await prismaDB.user.findFirst({
      where: { id: existingTask.authorId },
    });

    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    await createLog(taskId, userEmail, "Task completed");

    await sendEmail(author.email, userEmail);

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in the update process" });
  }
};

export const deleteTaskService = async (req: Request, res: Response) => {
  try {
    const taskId = +req.params.id;
    const userEmail = req.body.userEmail;

    const task = await prismaDB.task.findFirst({
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

    await prismaDB.task.delete({
      where: {
        id: taskId,
      },
    });

    await createLog(taskId, userEmail, "Task deleted");

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in the delete process" });
  }
};

export const editTaskService = async (req: Request, res: Response) => {
  try {
    const taskId = +req.params.id;
    const { userEmail, newAssignedUserId, title, completed } = req.body;

    const parsedNewAssignedUserId = parseInt(newAssignedUserId);

    const task = await prismaDB.task.findFirst({
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

    const newAssignedUser = await prismaDB.user.findUnique({
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

    const dataToUpdate: any = {
      assignedUserId: parsedNewAssignedUserId,
      title,
      completed: isCompleted,
    };

    if (completed === false) {
      dataToUpdate.completedDate = null;
    }

    await prismaDB.task.update({
      where: {
        id: taskId,
      },
      data: dataToUpdate,
    });

    await createLog(taskId, userEmail, "Task edited");

    return res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in the update process" });
  }
};
