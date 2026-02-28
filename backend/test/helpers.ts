/**
 * Test helpers — สร้าง JWT token สำหรับ test
 */
import { signToken } from "../src/utils/auth";

/** สร้าง JWT token ปลอม สำหรับ test (ไม่ต้อง login จริง) */
export function testToken(overrides: Partial<{ userId: number; email: string; role: string }> = {}) {
  return signToken({
    userId: overrides.userId ?? 999,
    email: overrides.email ?? "test@ku.th",
    role: overrides.role ?? "STUDENT",
  });
}

/** Authorization header สำหรับ supertest */
export function authHeader(role: string = "STUDENT") {
  return { Authorization: `Bearer ${testToken({ role })}` };
}
