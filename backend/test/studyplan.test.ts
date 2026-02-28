/**
 * ============================================================
 *  Study Plan — MongoDB CRUD + Soft Delete + Restore Tests
 * ============================================================
 *  Collection: study_plans
 *  Tests: Create, Read, Update, Delete(soft), Restore, List All
 */
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../src/app";
import { connectMongo } from "../src/config/mongo";
import { StudyPlanModel } from "../src/models/StudyPlan";
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
});

const PLAN = {
  studentId: "s-test-001",
  program: "Computer Science",
  version: "2026",
  categories: [
    { name: "Major", requiredCredits: 45 },
    { name: "Wellness", requiredCredits: 3 },
  ],
};

// ── CREATE ───────────────────────────────────────────────────
describe("POST /api/studyplan  (Create)", () => {
  it("should create a new study plan", async () => {
    const res = await request(app)
      .post("/api/studyplan")
      .set(authHeader())
      .send(PLAN);

    expect(res.status).toBe(201);
    expect(res.body.studentId).toBe(PLAN.studentId);
    expect(res.body.program).toBe("Computer Science");
    expect(res.body.categories).toHaveLength(2);
  });

  it("should reject invalid payload (missing program)", async () => {
    const res = await request(app)
      .post("/api/studyplan")
      .set(authHeader())
      .send({ studentId: "x" });

    expect(res.status).toBe(400);
  });
});

// ── READ ─────────────────────────────────────────────────────
describe("GET /api/studyplan/:studentId  (Read)", () => {
  it("should return study plan by studentId", async () => {
    await request(app).post("/api/studyplan").set(authHeader()).send(PLAN);

    const res = await request(app)
      .get(`/api/studyplan/${PLAN.studentId}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.studentId).toBe(PLAN.studentId);
    expect(res.body.categories).toHaveLength(2);
  });

  it("should return 404 when plan not found", async () => {
    const res = await request(app)
      .get("/api/studyplan/nonexistent")
      .set(authHeader());

    expect(res.status).toBe(404);
  });
});

// ── LIST ALL ─────────────────────────────────────────────────
describe("GET /api/studyplan  (List All)", () => {
  it("should list all study plans", async () => {
    await request(app).post("/api/studyplan").set(authHeader()).send(PLAN);
    await request(app).post("/api/studyplan").set(authHeader()).send({
      ...PLAN,
      studentId: "s-test-002",
    });

    const res = await request(app).get("/api/studyplan").set(authHeader());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});

// ── UPDATE ───────────────────────────────────────────────────
describe("POST /api/studyplan (Upsert / Update)", () => {
  it("should update existing plan when POST with same studentId", async () => {
    await request(app).post("/api/studyplan").set(authHeader()).send(PLAN);

    const updated = {
      ...PLAN,
      program: "Software Engineering",
      categories: [{ name: "Major", requiredCredits: 60 }],
    };
    const res = await request(app)
      .post("/api/studyplan")
      .set(authHeader())
      .send(updated);

    expect(res.status).toBe(200);
    expect(res.body.program).toBe("Software Engineering");
    expect(res.body.categories).toHaveLength(1);
    expect(res.body.categories[0].requiredCredits).toBe(60);
  });
});

// ── DELETE (Soft) ────────────────────────────────────────────
describe("DELETE /api/studyplan/student/:studentId  (Soft Delete)", () => {
  it("should soft delete and hide from GET", async () => {
    await request(app).post("/api/studyplan").set(authHeader()).send(PLAN);

    const del = await request(app)
      .delete(`/api/studyplan/student/${PLAN.studentId}`)
      .set(authHeader());
    expect(del.status).toBe(200);

    // Should not be found anymore
    const get = await request(app)
      .get(`/api/studyplan/${PLAN.studentId}`)
      .set(authHeader());
    expect(get.status).toBe(404);
  });

  it("should set deletedAt timestamp", async () => {
    await request(app).post("/api/studyplan").set(authHeader()).send(PLAN);
    await request(app)
      .delete(`/api/studyplan/student/${PLAN.studentId}`)
      .set(authHeader());

    const check = await request(app)
      .get(`/api/studyplan/student/${PLAN.studentId}/deleted`)
      .set(authHeader());
    expect(check.status).toBe(200);
    expect(check.body.deleted).toBe(true);
    expect(check.body.deletedAt).toBeTruthy();
  });
});

// ── RESTORE ──────────────────────────────────────────────────
describe("POST /api/studyplan/student/:studentId/restore  (Restore)", () => {
  it("should restore soft-deleted plan", async () => {
    await request(app).post("/api/studyplan").set(authHeader()).send(PLAN);
    await request(app)
      .delete(`/api/studyplan/student/${PLAN.studentId}`)
      .set(authHeader());

    const restore = await request(app)
      .post(`/api/studyplan/student/${PLAN.studentId}/restore`)
      .set(authHeader());
    expect(restore.status).toBe(200);

    // Should be accessible again
    const get = await request(app)
      .get(`/api/studyplan/${PLAN.studentId}`)
      .set(authHeader());
    expect(get.status).toBe(200);
    expect(get.body.studentId).toBe(PLAN.studentId);
  });
});

// ── AUTH ─────────────────────────────────────────────────────
describe("Auth: JWT protection", () => {
  it("should reject requests without token", async () => {
    const res = await request(app).get(`/api/studyplan/${PLAN.studentId}`);
    expect(res.status).toBe(401);
  });
});
