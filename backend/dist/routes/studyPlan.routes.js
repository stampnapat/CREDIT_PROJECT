"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studyPlanRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const StudyPlan_1 = require("../models/StudyPlan");
exports.studyPlanRouter = (0, express_1.Router)();
function sanitizeStudyPlan(doc) {
    if (!doc)
        return doc;
    const out = JSON.parse(JSON.stringify(doc));
    if (Array.isArray(out.categories)) {
        out.categories = out.categories.map((c) => ({ name: c.name, requiredCredits: c.requiredCredits }));
    }
    return out;
}
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    requiredCredits: zod_1.z.number().nonnegative()
});
const planSchema = zod_1.z.object({
    studentId: zod_1.z.string().min(1),
    program: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
    categories: zod_1.z.array(categorySchema).default([])
});
exports.studyPlanRouter.post("/", async (req, res) => {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error);
    }
    try {
        const existing = await StudyPlan_1.StudyPlanModel.findOne({
            studentId: parsed.data.studentId
        });
        if (existing) {
            existing.program = parsed.data.program;
            existing.version = parsed.data.version;
            // Deduplicate categories by name (case-insensitive) and set
            const deduped = Array.isArray(parsed.data.categories)
                ? parsed.data.categories.filter((c, i, arr) => arr.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase()) === i)
                : [];
            // Use Mongoose `set` to replace the DocumentArray with plain objects
            existing.set("categories", deduped);
            existing.isDeleted = false;
            await existing.save();
            return res.json(sanitizeStudyPlan(existing));
        }
        const created = await StudyPlan_1.StudyPlanModel.create({
            ...parsed.data,
            isDeleted: false
        });
        return res.status(201).json(sanitizeStudyPlan(created));
    }
    catch (err) {
        console.error("Create/Update error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.studyPlanRouter.put("/:id", async (req, res) => {
    const parsed = planSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error);
    }
    try {
        const updated = await StudyPlan_1.StudyPlanModel.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { $set: parsed.data }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Study plan not found" });
        }
        return res.json(sanitizeStudyPlan(updated));
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
exports.studyPlanRouter.post("/:studentId/category", async (req, res) => {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error);
    }
    try {
        // Prevent adding a category with the same name
        const plan = await StudyPlan_1.StudyPlanModel.findOne({ studentId: req.params.studentId, isDeleted: false });
        if (!plan)
            return res.status(404).json({ message: "Study plan not found" });
        const exists = plan.categories.some((c) => c.name.toLowerCase() === parsed.data.name.toLowerCase());
        if (exists) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const updated = await StudyPlan_1.StudyPlanModel.findOneAndUpdate({ studentId: req.params.studentId, isDeleted: false }, { $push: { categories: parsed.data } }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Study plan not found" });
        }
        return res.json(sanitizeStudyPlan(updated));
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
exports.studyPlanRouter.delete("/:studentId/category/:categoryId", async (req, res) => {
    try {
        const { studentId, categoryId } = req.params;
        const updated = await StudyPlan_1.StudyPlanModel.findOneAndUpdate({ studentId, isDeleted: false }, { $pull: { categories: { _id: categoryId } } }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Study plan not found" });
        }
        return res.json({
            message: "Category deleted",
            categoryId
        });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
exports.studyPlanRouter.delete("/student/:studentId", async (req, res) => {
    try {
        const updated = await StudyPlan_1.StudyPlanModel.findOneAndUpdate({
            studentId: req.params.studentId,
            isDeleted: false
        }, {
            $set: { isDeleted: true, deletedAt: new Date() }
        }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Study plan not found" });
        }
        return res.json({
            message: "Study plan soft deleted",
            studentId: req.params.studentId
        });
    }
    catch (err) {
        console.error("Soft delete error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
// Restore soft-deleted study plan
exports.studyPlanRouter.post("/student/:studentId/restore", async (req, res) => {
    try {
        const restored = await StudyPlan_1.StudyPlanModel.findOneAndUpdate({ studentId: req.params.studentId, isDeleted: true }, { $set: { isDeleted: false, deletedAt: null } }, { new: true });
        if (!restored)
            return res.status(404).json({ message: "No deleted study plan found" });
        return res.json({ message: "Restored", studentId: req.params.studentId });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
// Check whether a deleted study plan exists for a student
exports.studyPlanRouter.get("/student/:studentId/deleted", async (req, res) => {
    try {
        const doc = await StudyPlan_1.StudyPlanModel.findOne({ studentId: req.params.studentId, isDeleted: true }).lean();
        return res.json({ deleted: !!doc, deletedAt: doc ? doc.deletedAt : null });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
exports.studyPlanRouter.get("/:studentId", async (req, res) => {
    try {
        const doc = await StudyPlan_1.StudyPlanModel.findOne({
            studentId: req.params.studentId,
            isDeleted: false
        }).lean();
        if (!doc) {
            return res.status(404).json({ message: "Study plan not found" });
        }
        // Create a plain copy and remove internal subdocument _id fields from categories before returning
        const out = JSON.parse(JSON.stringify(doc));
        if (Array.isArray(out.categories)) {
            out.categories = out.categories.map((c) => ({
                name: c.name,
                requiredCredits: c.requiredCredits
            }));
        }
        return res.json(out);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});
