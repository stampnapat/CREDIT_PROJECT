import { Request, Response } from "express";
import { mysqlPool } from "../config/mysql";
import bcrypt from "bcrypt";

const ADMIN_EMAIL = "stampnapatt@gmail.com";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" });
  }

  // เช็ค email: ต้องเป็น @ku.th หรือ admin email เท่านั้น
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL;
  if (!isAdmin && !email.toLowerCase().endsWith("@ku.th")) {
    return res.status(403).json({ message: "กรุณาใช้อีเมล @ku.th เท่านั้น" });
  }

  try {
    // ค้นหา user ใน DB
    const [rows]: any = await mysqlPool.query(
      "SELECT * FROM users WHERE email = ? AND is_deleted = 0",
      [email]
    );

    if (rows.length > 0) {
      // มี user แล้ว → เช็ค password
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
      }
      return res.json({ message: "เข้าสู่ระบบสำเร็จ", userId: user.id, email: user.email, role: user.role });
    }

    // ยังไม่มี user → สร้างอัตโนมัติ
    const role = isAdmin ? "ADMIN" : "STUDENT";
    const hash = await bcrypt.hash(password, 10);
    const [result]: any = await mysqlPool.query(
      "INSERT INTO users (email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [email, hash, role]
    );

    return res.status(201).json({
      message: "สร้างบัญชีและเข้าสู่ระบบสำเร็จ",
      userId: result.insertId,
      email,
      role
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};
