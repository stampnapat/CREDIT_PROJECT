"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyPlanModel = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    requiredCredits: { type: Number, required: true }
}, { _id: true });
const StudyPlanSchema = new mongoose_1.Schema({
    studentId: { type: String, required: true, unique: true, index: true },
    program: { type: String, required: true },
    version: { type: String, required: true },
    categories: { type: [CategorySchema], default: [] },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });
exports.StudyPlanModel = (0, mongoose_1.model)("study_plans", StudyPlanSchema);
