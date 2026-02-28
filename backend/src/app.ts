// backend/src/app.ts
import express from "express";
import dotenv from "dotenv";
import { studyPlanRouter } from "./routes/studyPlan.routes";
import { completedCourseRouter } from "./routes/completedCourse.routes";
import { summaryRouter } from "./routes/summary.routes";
import { demoRouter } from "./routes/demo.routes";
import cors from "cors";
import usersRouter from "./routes/users";
import coursesRouter from "./routes/courses";
import enrollmentsRouter from "./routes/enrollments";
import { setupSwagger } from "./swagger";
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();

export const app = express();
app.use(express.json());
app.use(cors());

// Swagger UI and OpenAPI JSON
setupSwagger(app);

app.get("/health", (_, res) => res.json({ ok: true }));

// — Public routes (ไม่ต้อง login) —
app.use("/api/users", usersRouter);
app.use("/api/demo", demoRouter);

// — Protected routes (ต้อง login ด้วย JWT) —
app.use("/api/studyplan", authMiddleware, studyPlanRouter);
app.use("/api/completed-courses", authMiddleware, completedCourseRouter);
app.use("/api/summary", authMiddleware, summaryRouter);
app.use("/api/courses", authMiddleware, coursesRouter);
app.use("/api/enrollments", authMiddleware, enrollmentsRouter);