import express from "express";
import { registerSchema } from "../schemas/authSchema";
import { userRegister } from "../services/authSrevices";

const router = express.Router();

router.post("/register", registerSchema, userRegister);

export default router;
