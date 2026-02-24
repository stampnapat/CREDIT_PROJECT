"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, "กรุณากรอกชื่อผู้ใช้"),
    password: zod_1.z
        .string()
        .min(1, "กรุณากรอกรหัสผ่าน"),
    fullName: zod_1.z
        .string()
        .min(1, "กรุณากรอกชื่อ")
        .optional()
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .min(1, "กรุณากรอกชื่อผู้ใช้"),
    password: zod_1.z
        .string()
        .min(1, "กรุณากรอกรหัสผ่าน")
});
