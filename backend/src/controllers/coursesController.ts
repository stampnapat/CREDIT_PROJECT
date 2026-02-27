import { Request, Response } from 'express';
import * as service from '../services/coursesService';

export async function listCourses(req: Request, res: Response) {
  const courses = await service.listCourses();
  res.json(courses);
}

export async function getCourse(req: Request, res: Response) {
  const id = Number(req.params.id);
  const course = await service.getCourseById(id);
  if (!course) return res.status(404).json({ error: 'not found' });
  res.json(course);
}

export async function createCourse(req: Request, res: Response) {
  try {
    const { code, title, description, credits } = req.body;
    if (!code || !title) return res.status(400).json({ error: 'code and title are required' });
    const course = await service.createCourse({ code, title, description, credits: credits ? Number(credits) : undefined });
    res.status(201).json(course);
  } catch (err: any) {
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Course code already exists' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}

export async function updateCourse(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { code, title, description, credits } = req.body;
    const data: any = {};
    if (code !== undefined) data.code = code;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (credits !== undefined) data.credits = Number(credits);
    const updated = await service.updateCourse(id, data);
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Course not found' });
    if (err?.code === 'P2002') return res.status(409).json({ error: 'Course code already exists' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await service.softDeleteCourse(id);
    res.json({ message: 'Course soft deleted', id });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Course not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}
