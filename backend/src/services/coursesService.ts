import prisma from '../prismaClient';

export async function listCourses() {
  return prisma.course.findMany({ where: { isDeleted: false }, orderBy: { code: 'asc' } });
}

export async function getCourseById(id: number) {
  return prisma.course.findFirst({ where: { id, isDeleted: false } });
}

export async function createCourse(data: { code: string; title: string; description?: string; credits?: number }) {
  return prisma.course.create({
    data: {
      code: data.code,
      title: data.title,
      description: data.description ?? null,
      credits: data.credits ?? 3,
    },
  });
}

export async function updateCourse(id: number, data: { code?: string; title?: string; description?: string; credits?: number }) {
  return prisma.course.update({
    where: { id },
    data,
  });
}

export async function softDeleteCourse(id: number) {
  return prisma.course.update({
    where: { id },
    data: { isDeleted: true },
  });
}
