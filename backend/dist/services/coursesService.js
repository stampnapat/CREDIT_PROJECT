"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCourses = listCourses;
exports.getCourseById = getCourseById;
const prismaClient_1 = __importDefault(require("../prismaClient"));
async function listCourses() {
    return prismaClient_1.default.course.findMany({ where: { isDeleted: false }, orderBy: { code: 'asc' } });
}
async function getCourseById(id) {
    return prismaClient_1.default.course.findFirst({ where: { id, isDeleted: false } });
}
