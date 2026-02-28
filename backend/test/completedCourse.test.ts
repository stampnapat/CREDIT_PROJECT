/**
 * ============================================================
 *  Completed Course — MongoDB CRUD + Soft Delete Tests
 * ============================================================
 *  Collection: completed_courses
 *  Tests: Create, List All, Read by Student, Full Update,
 *         Update Grade, Soft Delete, Auth
 */
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../src/app";
import { connectMongo } from "../src/config/mongo";
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
  await CompletedCourseModel.deleteMany({});
});

const COURSE = {
  studentId: "s-test-001",
  courseId: "CS101",
  courseName: "Programming I",
  category: "Core",
  credits: 3,
  grade: "A",
  term: "1/2026",
};

// ── CREATE ───────────────────────────────────────────────────
describe("POST /api/completed-courses  (Create)", () => {
  it("should create a completed course", async () => {
    const res = await request(app)
      .post("/api/completed-courses")
      .set(authHeader())
      .send(COURSE);

    expect(res.status).toBe(201);
    expect(res.body.courseId).toBe("CS101");
    expect(res.body.grade).toBe("A");
    expect(res.body.isDeleted).toBe(false);
  });

  it("should reject invalid payload (missing grade)", async () => {
    const { grade, ...noGrade } = COURSE;
    const res = await request(app)
      .post("/api/completed-courses")
      .set(authHeader())
      .send(noGrade);

    expect(res.status).toBe(400);
  });
});

// ── LIST ALL ─────────────────────────────────────────────────
describe("GET /api/completed-courses  (List All)", () => {
  it("should return all non-deleted courses", async () => {
    await CompletedCourseModel.create(COURSE);
    await CompletedCourseModel.create({ ...COURSE, courseId: "CS201", courseName: "Data Structures" });
    await CompletedCourseModel.create({ ...COURSE, courseId: "CS301", isDeleted: true }); // soft-deleted

    const res = await request(app).get("/api/completed-courses").set(authHeader());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2); // soft-deleted excluded
  });
});

// ── READ BY STUDENT ──────────────────────────────────────────
describe("GET /api/completed-courses/by-student/:studentId  (Read)", () => {
  it("should return courses for given student", async () => {
    await CompletedCourseModel.create(COURSE);
    await CompletedCourseModel.create({ ...COURSE, studentId: "s-other" });

    const res = await request(app)
      .get(`/api/completed-courses/by-student/${COURSE.studentId}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].studentId).toBe(COURSE.studentId);
  });

  it("should exclude soft-deleted courses", async () => {
    await CompletedCourseModel.create(COURSE);
    await CompletedCourseModel.create({ ...COURSE, courseId: "CS999", isDeleted: true });

    const res = await request(app)
      .get(`/api/completed-courses/by-student/${COURSE.studentId}`)
      .set(authHeader());

    expect(res.body.length).toBe(1);
  });
});

// ── FULL UPDATE ──────────────────────────────────────────────
describe("PUT /api/completed-courses/:id  (Full Update)", () => {
  it("should update multiple fields at once", async () => {
    const doc = await CompletedCourseModel.create(COURSE);

    const res = await request(app)
      .put(`/api/completed-courses/${doc._id}`)
      .set(authHeader())
      .send({ grade: "B+", credits: 4, term: "2/2026" });

    expect(res.status).toBe(200);
    expect(res.body.grade).toBe("B+");
    expect(res.body.credits).toBe(4);
    expect(res.body.term).toBe("2/2026");
    // unchanged fields
    expect(res.body.courseName).toBe("Programming I");
  });

  it("should return 404 for non-existent id", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/completed-courses/${fakeId}`)
      .set(authHeader())
      .send({ grade: "C" });

    expect(res.status).toBe(404);
  });
});

// ── UPDATE GRADE ONLY ────────────────────────────────────────
describe("PUT /api/completed-courses/:id/grade  (Update Grade)", () => {
  it("should update only grade", async () => {
    const doc = await CompletedCourseModel.create(COURSE);

    const res = await request(app)
      .put(`/api/completed-courses/${doc._id}/grade`)
      .set(authHeader())
      .send({ grade: "B" });

    expect(res.status).toBe(200);
    expect(res.body.grade).toBe("B");
    expect(res.body.credits).toBe(3); // unchanged
  });
});

// ── SOFT DELETE ───────────────────────────────────────────────
describe("DELETE /api/completed-courses/:id  (Soft Delete)", () => {
  it("should soft delete a course", async () => {
    const doc = await CompletedCourseModel.create(COURSE);

    const res = await request(app)
      .delete(`/api/completed-courses/${doc._id}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Deleted");

    // Verify it's hidden
    const list = await request(app)
      .get(`/api/completed-courses/by-student/${COURSE.studentId}`)
      .set(authHeader());
    expect(list.body.length).toBe(0);
  });

  it("should return 404 for already-deleted course", async () => {
    const doc = await CompletedCourseModel.create({ ...COURSE, isDeleted: true });

    const res = await request(app)
      .delete(`/api/completed-courses/${doc._id}`)
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});

// ── AUTH ─────────────────────────────────────────────────────
describe("Auth: JWT protection", () => {
  it("should reject requests without token", async () => {
    const res = await request(app).get("/api/completed-courses");
    expect(res.status).toBe(401);
  });

  it("should reject requests with invalid token", async () => {
    const res = await request(app)
      .get("/api/completed-courses")
      .set({ Authorization: "Bearer invalid.token.here" });
    expect(res.status).toBe(401);
  });
});
