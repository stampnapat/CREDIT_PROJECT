"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.getUserSafeById = getUserSafeById;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const auth_1 = require("../utils/auth");
async function createUser(data) {
    const passwordHash = await (0, auth_1.hashPassword)(data.password);
    const user = await prismaClient_1.default.user.create({
        data: {
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            role: data.role ? data.role : client_1.Role.STUDENT
        },
        select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true }
    });
    return user;
}
async function findUserByEmail(email) {
    return prismaClient_1.default.user.findFirst({ where: { email, isDeleted: false } });
}
async function getUserSafeById(id) {
    return prismaClient_1.default.user.findFirst({
        where: { id, isDeleted: false },
        select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true }
    });
}
