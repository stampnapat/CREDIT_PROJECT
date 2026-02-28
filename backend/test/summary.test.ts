/**
 * ============================================================
 *  Summary — Aggregation endpoint (MongoDB cross-collection)
 * ============================================================
 *  GET /api/summary/:studentId
 *  Combines StudyPlan + CompletedCourses → progress summary
 */
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../src/app";
import { connectMongo } from "../src/config/mongo";
import { StudyPlanModel } from "../src/models/StudyPlan";
import { CompletedCourseModel } from "../src/models/CompletedCourse";
import { authHeader } from "./helpers";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectMongo(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await StudyPlanModel.deleteMany({});
  await CompletedCourseModel.deleteMany({});
});

const SID = "s-test-001";

async function seedPlanAndCourses() {
  await StudyPlanModel.create({
    studentId: SID,
    program: "Computer Science",
    version: "2026",
    categories: [
      { name: "Core", requiredCredits: 30 },
      { name: "Major", requiredCredits: 45 },
      { name: "Free", requiredCredits: 6 },
    ],
  });

  await CompletedCourseModel.insertMany([
    { studentId: SID, courseId: "CS101", courseName: "Prog I", category: "Core", credits: 3, grade: "A", term: "1/2026" },
    { studentId: SID, courseId: "CS102", courseName: "Prog II", category: "Core", credits: 3, grade: "B+", term: "1/2026" },
    { studentId: SID, courseId: "CS201", courseName: "Data Structures", category: "Major", credits: 3, grade: "A", term: "1/2026" },
  ]);
}

// ── FULL SUMMARY ─────────────────────────────────────────────
describe("GET /api/summary/:studentId", () => {
  it("should return aggregated credit summary", async () => {
    await seedPlanAndCourses();

    const res = await request(app)
      .get(`/api/summary/${SID}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.studentId).toBe(SID);
    expect(res.body.program).toBe("Computer Science");
    expect(res.body.totalCredits).toBe(9); // 3+3+3
    expect(res.body.categories).toHaveLength(3);
  });

  it("should compute per-category progress correctly", async () => {
    await seedPlanAndCourses();

    const res = await request(app)
      .get(`/api/summary/${SID}`)
      .set(authHeader());

    const core = res.body.categories.find((c: any) => c.category === "Core");
    expect(core.required).toBe(30);
    expect(core.earned).toBe(6);          // 3+3
    expect(core.remaining).toBe(24);      // 30-6
    expect(core.completed).toBe(false);

    const major = res.body.categories.find((c: any) => c.category === "Major");
    expect(major.earned).toBe(3);
    expect(major.remaining).toBe(42);     // 45-3

    const free = res.body.categories.find((c: any) => c.category === "Free");
    expect(free.earned).toBe(0);
    expect(free.remaining).toBe(6);
  });

  it("should list remaining categories", async () => {
    await seedPlanAndCourses();

    const res = await request(app)
      .get(`/api/summary/${SID}`)
      .set(authHeader());

    expect(res.body.remainingList).toHaveLength(3); // none completed yet
    expect(res.body.remainingList.map((r: any) => r.category)).toContain("Free");
  });

  it("should mark category as completed when earned >= required", async () => {
    await StudyPlanModel.create({
      studentId: SID,
      program: "CS",
      version: "2026",
      categories: [{ name: "Wellness", requiredCredits: 3 }],
    });

    await CompletedCourseModel.create({
      studentId: SID,
      courseId: "WE101",
      courseName: "Exercise for Health",
      category: "Wellness",
      credits: 3,
      grade: "A",
      term: "1/2026",
    });

    const res = await request(app)
      .get(`/api/summary/${SID}`)
      .set(authHeader());

    const wellness = res.body.categories[0];
    expect(wellness.completed).toBe(true);
    expect(wellness.remaining).toBe(0);
    expect(res.body.remainingList).toHaveLength(0);
  });
});

// ── EDGE CASES ───────────────────────────────────────────────
describe("GET /api/summary/:studentId — Edge cases", () => {
  it("should return message when no study plan exists", async () => {
    const res = await request(app)
      .get(`/api/summary/${SID}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("No study plan found");
    expect(res.body.totalCredits).toBe(0);
  });

  it("should exclude soft-deleted completed courses", async () => {
    await StudyPlanModel.create({
      studentId: SID,
      program: "CS",
      version: "2026",
      categories: [{ name: "Core", requiredCredits: 30 }],
    });

    await CompletedCourseModel.create({
      studentId: SID, courseId: "C1", courseName: "Active", category: "Core",
      credits: 3, grade: "A", term: "1/2026", isDeleted: false,
    });
    await CompletedCourseModel.create({
      studentId: SID, courseId: "C2", courseName: "Deleted", category: "Core",
      credits: 3, grade: "B", term: "1/2026", isDeleted: true,
    });

    const res = await request(app)
      .get(`/api/summary/${SID}`)
      .set(authHeader());

    expect(res.body.totalCredits).toBe(3); // deleted one excluded
  });
});

// ── AUTH ─────────────────────────────────────────────────────
describe("Auth: JWT protection", () => {
  it("should reject requests without token", async () => {
    const res = await request(app).get(`/api/summary/${SID}`);
    expect(res.status).toBe(401);
  });
});
