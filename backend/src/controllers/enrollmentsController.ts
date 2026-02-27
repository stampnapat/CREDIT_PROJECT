import { Request, Response } from 'express';
import * as service from '../services/enrollmentsService';

export async function createEnrollment(req: Request, res: Response) {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ error: 'userId and courseId required' });
    const r = await service.enrollUser(Number(userId), Number(courseId));
    res.status(201).json(r);
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'User already enrolled in this course' });
    res.status(500).json({ error: err?.message || err });
  }
}

export async function listByUser(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const rows = await service.listEnrollmentsByUser(userId);
  res.json(rows);
}

export async function listAll(req: Request, res: Response) {
  const rows = await service.listAllEnrollments();
  res.json(rows);
}

export async function updateEnrollment(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status, grade, creditsEarned } = req.body;
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (grade !== undefined) data.grade = grade;
    if (creditsEarned !== undefined) data.creditsEarned = Number(creditsEarned);
    const updated = await service.updateEnrollment(id, data);
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Enrollment not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}

export async function deleteEnrollment(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await service.softDeleteEnrollment(id);
    res.json({ message: 'Enrollment soft deleted', id });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Enrollment not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}
