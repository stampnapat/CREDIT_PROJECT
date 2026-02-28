import { Request, Response } from 'express';
import * as service from '../services/usersService';
import { loginSchema } from '../utils/validation';
import { comparePassword, signToken } from '../utils/auth';

const ADMIN_EMAILS = ["stampnapatt@gmail.com", "admin"];

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });
    }

    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    if (!isAdmin && !email.toLowerCase().endsWith("@ku.th")) {
      return res.status(403).json({ error: "กรุณาใช้อีเมล @ku.th เท่านั้น" });
    }

    const existing = await service.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "อีเมลนี้ถูกใช้แล้ว" });
    }

    const role = isAdmin ? "ADMIN" : "STUDENT";
    const user = await service.createUser({ email, password, role });
    res.status(201).json(user);

  } catch (err: any) {
    if (err.errors && err.errors.length > 0) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(400).json({ error: "ข้อมูลไม่ถูกต้อง" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.parse(req.body);
    const email = parsed.email.trim().toLowerCase();

    // เช็ค email: ต้องเป็น @ku.th หรือ admin email เท่านั้น
    const isAdmin = ADMIN_EMAILS.includes(email);
    if (!isAdmin && !email.endsWith("@ku.th")) {
      return res.status(403).json({ error: "กรุณาใช้อีเมล @ku.th เท่านั้น" });
    }

    let user = await service.findUserByEmail(email);

    if (user) {
      // มี user แล้ว → เช็ค password
      const ok = await comparePassword(parsed.password, (user as any).passwordHash);
      if (!ok) {
        return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });
      }
    } else {
      // ยังไม่มี user → สร้างอัตโนมัติ
      const role = isAdmin ? "ADMIN" : "STUDENT";
      await service.createUser({ email, password: parsed.password, role });
      user = await service.findUserByEmail(email);
    }

    const token = signToken({
      userId: user!.id,
      email: user!.email,
      role: user!.role
    });

    const safe = await service.getUserSafeById(user!.id);
    res.json({ token, user: safe });

  } catch (err: any) {
    if (err.errors && err.errors.length > 0) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(400).json({ error: "เข้าสู่ระบบไม่สำเร็จ" });
  }
}

export async function listAllUsers(req: Request, res: Response) {
  try {
    const users = await service.listAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { fullName, role } = req.body;
    const updated = await service.updateUser(id, { fullName, role });
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await service.softDeleteUser(id);
    res.json({ message: 'User soft deleted', id });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    res.status(500).json({ error: err?.message || 'Server error' });
  }
}