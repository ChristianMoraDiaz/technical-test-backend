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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLogin = exports.userRegister = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_validator_1 = require("express-validator");
const db_1 = __importDefault(require("../db"));
const userRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }
    try {
        const userExist = yield db_1.default.user.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (userExist) {
            return res.status(500).json({ message: "User already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
        const response = yield db_1.default.user.create({
            data: Object.assign(Object.assign({}, req.body), { password: hashedPassword }),
        });
        const { password: _ } = response, user = __rest(response, ["password"]);
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.userRegister = userRegister;
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userExist = yield db_1.default.user.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (!userExist)
            return res.status(500).json({ message: "Email doesn't exists" });
        const matchPassword = yield bcrypt_1.default.compare(req.body.password, userExist.password);
        if (!matchPassword)
            return res.status(500).json({ message: "Wrong password" });
        return res.status(200).json(userExist);
    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.userLogin = userLogin;
