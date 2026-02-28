import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

/**
 * JWT Authentication Middleware
 * ตรวจสอบ Authorization header: Bearer <token>
 * ถ้าผ่าน จะ set req.user ให้ใช้ใน controller
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อน (Missing token)" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token) as {
      userId: number;
      email: string;
      role: string;
    };

    // Attach user info to request object
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

/**
 * Admin-only Middleware — ใช้ต่อจาก authMiddleware
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ error: "เฉพาะ Admin เท่านั้น" });
  }
  next();
}
