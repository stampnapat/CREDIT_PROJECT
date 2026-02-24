import prisma from '../prismaClient';

export async function listCourses() {
  return prisma.course.findMany({ where: { isDeleted: false }, orderBy: { code: 'asc' } });
}

export async function getCourseById(id: number) {
  return prisma.course.findFirst({ where: { id, isDeleted: false } });
}
