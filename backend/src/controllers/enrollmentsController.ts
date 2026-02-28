import { Request, Response } from 'express';
import * as service from '../services/enrollmentsService';
import { CompletedCourseModel } from '../models/CompletedCourse';
import prisma from '../prismaClient';

/**
 * Helper: sync enrollment → MongoDB completed_courses
 * เมื่อ status เป็น COMPLETED ให้สร้าง document ใน MongoDB ด้วย
 */
async function syncToMongo(enrollment: any) {
  if (enrollment.status !== 'COMPLETED') return;

  // ดึงข้อมูล user email + course info จาก MySQL
  const user = await prisma.user.findUnique({ where: { id: enrollment.userId } });
  const course = enrollment.course || await prisma.course.findUnique({ where: { id: enrollment.courseId } });
  if (!user || !course) return;

  const studentId = user.email;

  // เช็คว่ามีอยู่แล้วหรือยัง (ไม่สร้างซ้ำ)
  const exists = await CompletedCourseModel.findOne({
    studentId,
    courseId: course.code,
    isDeleted: false
  });

  if (!exists) {
    await CompletedCourseModel.create({
      studentId,
      courseId: course.code,
      courseName: course.title,
      category: 'Major',           // default — user สามารถแก้ได้ภายหลัง
      credits: course.credits,
      grade: enrollment.grade || '-',
      term: new Date().getFullYear() + '',
      isDeleted: false
    });
  } else if (enrollment.grade && enrollment.grade !== exists.grade) {
    // อัปเดตเกรดถ้าเปลี่ยน
    await CompletedCourseModel.findByIdAndUpdate(exists._id, { grade: enrollment.grade });
  }
}

/**
 * Helper: ลบ completed course จาก MongoDB เมื่อลบ enrollment
 */
async function removeFromMongo(enrollmentId: number) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { user: true, course: true }
  });
  if (!enrollment || !enrollment.user || !enrollment.course) return;

  await CompletedCourseModel.updateMany(
    { studentId: enrollment.user.email, courseId: enrollment.course.code, isDeleted: false },
    { $set: { isDeleted: true } }
  );
}

export async function createEnrollment(req: Request, res: Response) {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) return res.status(400).json({ error: 'userId and courseId required' });
    const r = await service.enrollUser(Number(userId), Number(courseId));

    // Sync: enrollment สถานะ COMPLETED → เพิ่มใน MongoDB ด้วย
    const full = await prisma.enrollment.findUnique({
      where: { id: r.id },
      include: { course: true, user: true }
    });
    if (full) await syncToMongo(full);

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

    // Sync: ถ้าสถานะเป็น COMPLETED → เพิ่มใน MongoDB ด้วย
    const full = await prisma.enrollment.findUnique({
      where: { id },
      include: { course: true, user: true }
    });
    if (full) await syncToMongo(full);

    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Enrollment not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}

export async function deleteEnrollment(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    // Sync: ลบจาก MongoDB ก่อน ("completed_courses" ของ user นี้)
    await removeFromMongo(id);

    await service.softDeleteEnrollment(id);
    res.json({ message: 'Enrollment soft deleted (MySQL + MongoDB synced)', id });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'Enrollment not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}
