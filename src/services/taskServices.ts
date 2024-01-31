import { Request, Response } from "express";
import { validationResult } from "express-validator";
import prismaDB from "../db";

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const response = await prismaDB.task.create({
      data: {
        ...req.body,
      },
    });

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error in the creation");
  }
};

export const setCompletedTask = async (req: Request, res: Response) => {
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

    return res.json(updatedTask);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in the update process" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = +req.params.id;
    const userEmail = req.body.userEmail;

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
        .json({ message: "You are not authorized to delete this task" });
    }

    await prismaDB.task.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in the delete process" });
  }
};
