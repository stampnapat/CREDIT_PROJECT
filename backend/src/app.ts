// backend/src/app.ts
import { registerRouter } from "./routes/register.routes";
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

dotenv.config();

export const app = express();
app.use(express.json());
app.use(cors());

// Swagger UI and OpenAPI JSON
setupSwagger(app);

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/studyplan", studyPlanRouter);
app.use("/api/completed-courses", completedCourseRouter);
app.use("/api/summary", summaryRouter);
app.use("/api/demo", demoRouter);

app.use("/api/users", usersRouter);
app.use("/api/register", registerRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);