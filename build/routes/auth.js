"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authSchema_1 = require("../schemas/authSchema");
const authSrevices_1 = require("../services/authSrevices");
const router = express_1.default.Router();
router.post("/login", authSrevices_1.userLogin);
router.post("/register", authSchema_1.registerSchema, authSrevices_1.userRegister);
exports.default = router;
