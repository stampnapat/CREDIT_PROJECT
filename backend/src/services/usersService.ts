import { Role } from "@prisma/client";
import prisma from '../prismaClient';
import { hashPassword } from '../utils/auth';

export async function createUser(data: { email: string; password: string; fullName?: string; role?: string }) {
  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role ? (data.role as Role) : Role.STUDENT
    },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true }
  });
  return user;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email, isDeleted: false } });
}

export async function getUserSafeById(id: number) {
  return prisma.user.findFirst({
    where: { id, isDeleted: false },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true }
  });
}
