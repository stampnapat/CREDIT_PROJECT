"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const service = __importStar(require("../services/usersService"));
const validation_1 = require("../utils/validation");
const auth_1 = require("../utils/auth");
async function register(req, res) {
    try {
        const parsed = validation_1.registerSchema.parse(req.body);
        const existing = await service.findUserByEmail(parsed.email);
        if (existing) {
            return res.status(409).json({ error: "อีเมลนี้ถูกใช้แล้ว" });
        }
        const user = await service.createUser(parsed);
        res.status(201).json(user);
    }
    catch (err) {
        // กรณี Zod validation error
        if (err.errors && err.errors.length > 0) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
    }
}
async function login(req, res) {
    try {
        const parsed = validation_1.loginSchema.parse(req.body);
        const user = await service.findUserByEmail(parsed.email);
        if (!user) {
            return res.status(401).json({ error: "ยังไม่ได้สมัครสมาชิก" });
        }
        const ok = await (0, auth_1.comparePassword)(parsed.password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
        }
        const token = (0, auth_1.signToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        const safe = await service.getUserSafeById(user.id);
        res.json({ token, user: safe });
    }
    catch (err) {
        if (err.errors && err.errors.length > 0) {
            return res.status(400).json({ error: err.errors[0].message });
        }
        res.status(400).json({ error: "เข้าสู่ระบบไม่สำเร็จ" });
    }
}
