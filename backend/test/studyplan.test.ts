import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../src/app';
import { connectMongo } from '../src/config/mongo';
import { StudyPlanModel } from '../src/models/StudyPlan';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectMongo(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await StudyPlanModel.deleteMany({});
});

test('delete -> check deleted -> restore flow', async () => {
  const studentId = 's-test-1';
  // create
  const payload = {
    studentId,
    program: 'CS',
    version: '2026',
    categories: [
      { name: 'Core', requiredCredits: 30 },
      { name: 'Major', requiredCredits: 60 }
    ]
  };

  const createRes = await request(app).post('/api/studyplan').send(payload);
  expect(createRes.status).toBe(201);
  expect(createRes.body.studentId).toBe(studentId);

  // delete
  const delRes = await request(app).delete(`/api/studyplan/student/${studentId}`);
  expect(delRes.status).toBe(200);

  // check deleted
  const checkRes = await request(app).get(`/api/studyplan/student/${studentId}/deleted`);
  expect(checkRes.status).toBe(200);
  expect(checkRes.body.deleted).toBe(true);
  expect(checkRes.body.deletedAt).toBeTruthy();

  // restore
  const restoreRes = await request(app).post(`/api/studyplan/student/${studentId}/restore`);
  expect(restoreRes.status).toBe(200);

  // fetch plan
  const getRes = await request(app).get(`/api/studyplan/${studentId}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.studentId).toBe(studentId);
});
