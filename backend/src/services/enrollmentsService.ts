import prisma from '../prismaClient';
import { EnrollmentStatus } from '@prisma/client';

export async function enrollUser(userId: number, courseId: number) {
  return prisma.enrollment.create({
    data: { userId, courseId, status: 'COMPLETED', creditsEarned: undefined }
  });
}

export async function listEnrollmentsByUser(userId: number) {
  return prisma.enrollment.findMany({
    where: { userId, isDeleted: false },
    include: { course: true }
  });
}

export async function listAllEnrollments() {
  return prisma.enrollment.findMany({
    where: { isDeleted: false },
    include: { course: true, user: { select: { id: true, email: true, fullName: true } } },
    orderBy: { enrolledAt: 'desc' }
  });
}

export async function updateEnrollment(id: number, data: { status?: string; grade?: string; creditsEarned?: number }) {
  const updateData: any = {};
  if (data.status !== undefined) {
    updateData.status = data.status as EnrollmentStatus;
    // Set completedAt automatically when status changes to COMPLETED
    if (data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }
  }
  if (data.grade !== undefined) updateData.grade = data.grade;
  if (data.creditsEarned !== undefined) updateData.creditsEarned = data.creditsEarned;
  return prisma.enrollment.update({
    where: { id },
    data: updateData,
    include: { course: true }
  });
}

export async function softDeleteEnrollment(id: number) {
  return prisma.enrollment.update({
    where: { id },
    data: { isDeleted: true }
  });
}
