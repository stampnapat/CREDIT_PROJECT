import { Router, Request, Response } from "express";
import { z } from "zod";
import { StudyPlanModel } from "../models/StudyPlan";

export const studyPlanRouter = Router();

function sanitizeStudyPlan(doc: any) {
  if (!doc) return doc;
  const out: any = JSON.parse(JSON.stringify(doc));
  if (Array.isArray(out.categories)) {
    out.categories = out.categories.map((c: any) => ({ name: c.name, requiredCredits: c.requiredCredits }));
  }
  return out;
}

const categorySchema = z.object({
  name: z.string().min(1),
  requiredCredits: z.number().nonnegative()
});

const planSchema = z.object({
  studentId: z.string().min(1),
  program: z.string().min(1),
  version: z.string().min(1),
  categories: z.array(categorySchema).default([])
});

studyPlanRouter.post("/", async (req: Request, res: Response) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  try {
    const existing = await StudyPlanModel.findOne({
      studentId: parsed.data.studentId
    });

    if (existing) {
      existing.program = parsed.data.program;
      existing.version = parsed.data.version;
      // Deduplicate categories by name (case-insensitive) and set
      const deduped = Array.isArray(parsed.data.categories)
        ? parsed.data.categories.filter(
            (c, i, arr) => arr.findIndex(x => x.name.toLowerCase() === c.name.toLowerCase()) === i
          )
        : [];

      // Use Mongoose `set` to replace the DocumentArray with plain objects
      existing.set("categories", deduped);
      existing.isDeleted = false;

      await existing.save();
      return res.json(sanitizeStudyPlan(existing));
    }

    const created = await StudyPlanModel.create({
      ...parsed.data,
      isDeleted: false
    });

    return res.status(201).json(sanitizeStudyPlan(created));

  } catch (err: any) {
    console.error("Create/Update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

studyPlanRouter.put("/:id", async (req: Request, res: Response) => {
  const parsed = planSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  try {
    const updated = await StudyPlanModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: parsed.data },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    return res.json(sanitizeStudyPlan(updated));

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

studyPlanRouter.post(
  "/:studentId/category",
  async (req: Request, res: Response) => {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    try {
      // Prevent adding a category with the same name
      const plan = await StudyPlanModel.findOne({ studentId: req.params.studentId, isDeleted: false });
      if (!plan) return res.status(404).json({ message: "Study plan not found" });

      const exists = plan.categories.some(
        (c: any) => c.name.toLowerCase() === parsed.data.name.toLowerCase()
      );

      if (exists) {
        return res.status(400).json({ message: "Category already exists" });
      }

      const updated = await StudyPlanModel.findOneAndUpdate(
        { studentId: req.params.studentId, isDeleted: false },
        { $push: { categories: parsed.data } },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Study plan not found" });
      }

      return res.json(sanitizeStudyPlan(updated));

    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
);

studyPlanRouter.delete(
  "/:studentId/category/:categoryId",
  async (req: Request, res: Response) => {
    try {
      const { studentId, categoryId } = req.params;

      const updated = await StudyPlanModel.findOneAndUpdate(
        { studentId, isDeleted: false },
        { $pull: { categories: { _id: categoryId } } },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Study plan not found" });
      }

      return res.json({
        message: "Category deleted",
        categoryId
      });

    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
);


studyPlanRouter.delete(
  "/student/:studentId",
  async (req: Request, res: Response) => {
    try {
      const updated = await StudyPlanModel.findOneAndUpdate(
        {
          studentId: req.params.studentId,
          isDeleted: false
        },
        {
          $set: { isDeleted: true, deletedAt: new Date() }
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Study plan not found" });
      }

      return res.json({
        message: "Study plan soft deleted",
        studentId: req.params.studentId
      });

    } catch (err: any) {
      console.error("Soft delete error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Restore soft-deleted study plan
studyPlanRouter.post(
  "/student/:studentId/restore",
  async (req: Request, res: Response) => {
    try {
      const restored = await StudyPlanModel.findOneAndUpdate(
        { studentId: req.params.studentId, isDeleted: true },
        { $set: { isDeleted: false, deletedAt: null } },
        { new: true }
      );

      if (!restored) return res.status(404).json({ message: "No deleted study plan found" });

      return res.json({ message: "Restored", studentId: req.params.studentId });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
);

// Check whether a deleted study plan exists for a student
studyPlanRouter.get(
  "/student/:studentId/deleted",
  async (req: Request, res: Response) => {
      try {
        const doc = await StudyPlanModel.findOne({ studentId: req.params.studentId, isDeleted: true }).lean();
        return res.json({ deleted: !!doc, deletedAt: doc ? doc.deletedAt : null });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }
);

studyPlanRouter.get("/:studentId", async (req: Request, res: Response) => {
  try {
    const doc = await StudyPlanModel.findOne({
      studentId: req.params.studentId,
      isDeleted: false
    }).lean();

    if (!doc) {
      return res.status(404).json({ message: "Study plan not found" });
    }
    // Create a plain copy and remove internal subdocument _id fields from categories before returning
    const out: any = JSON.parse(JSON.stringify(doc));
    if (Array.isArray(out.categories)) {
      out.categories = out.categories.map((c: any) => ({
        name: c.name,
        requiredCredits: c.requiredCredits
      }));
    }

    return res.json(out);

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});