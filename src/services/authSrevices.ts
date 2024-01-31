import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import prismaDB from "../db";

export const userRegister = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  try {
    const userExist = await prismaDB.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (userExist) {
      return res.status(500).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const response = await prismaDB.user.create({
      data: { ...req.body, password: hashedPassword },
    });

    const { password: _, ...user } = response;
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const userExist = await prismaDB.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (!userExist)
      return res.status(500).json({ message: "Email doesn't exists" });

    const matchPassword = await bcrypt.compare(
      req.body.password,
      userExist.password
    );

    if (!matchPassword)
      return res.status(500).json({ message: "Wrong password" });

    return res.status(200).json(userExist);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
