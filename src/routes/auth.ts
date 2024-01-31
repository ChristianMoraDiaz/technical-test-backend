import express from "express";
import { registerSchema } from "../schemas/authSchema";
import { userLogin, userRegister } from "../services/authSrevices";

const router = express.Router();

router.post("/login", userLogin);
router.post("/register", registerSchema, userRegister);

export default router;
