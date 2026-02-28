/**
 * ============================================================
 *  Demo Reset — Quick demo data seeding endpoint
 * ============================================================
 *  POST /api/demo/reset  (public route — no auth required)
 */
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../src/app";
import { connectMongo } from "../src/config/mongo";
import { StudyPlanModel } from "../src/models/StudyPlan";
import { CompletedCourseModel } from "../src/models/CompletedCourse";

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

describe("POST /api/demo/reset", () => {
  it("should seed demo data for default studentId S001", async () => {
    const res = await request(app)
      .post("/api/demo/reset")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.plan).toBeDefined();
    expect(res.body.plan.studentId).toBe("S001");
    expect(res.body.plan.program).toBe("Computer Science");
    expect(res.body.coursesCount).toBeGreaterThanOrEqual(2);
  });

  it("should seed demo data for custom studentId", async () => {
    const res = await request(app)
      .post("/api/demo/reset")
      .send({ studentId: "CUSTOM-99" });

    expect(res.status).toBe(200);
    expect(res.body.plan.studentId).toBe("CUSTOM-99");
  });

  it("should overwrite previous demo data on re-run", async () => {
    await request(app).post("/api/demo/reset").send({});
    await request(app).post("/api/demo/reset").send({});

    // Should have exactly one plan, not duplicates
    const plans = await StudyPlanModel.find({ studentId: "S001" });
    expect(plans.length).toBe(1);
  });
});
