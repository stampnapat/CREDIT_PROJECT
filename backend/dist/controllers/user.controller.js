"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const users = [];
const registerUser = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
    }
    const exist = users.find(u => u.username === username);
    if (exist) {
        return res.status(409).json({ message: "Username นี้ถูกใช้แล้ว" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
};
exports.registerUser = registerUser;
const loginUser = (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Username หรือ Password ไม่ถูกต้อง" });
    }
    return res.json({ message: "เข้าสู่ระบบสำเร็จ" });
};
exports.loginUser = loginUser;
