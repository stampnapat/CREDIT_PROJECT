# KU Credit Tracker — College Enrollment Platform

ระบบเช็คหน่วยกิต & แผนการเรียน สำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์  
พัฒนาเป็นโปรเจกต์วิชา **01204351 Database Systems**

## สถาปัตยกรรมระบบ (System Architecture)

```
┌──────────────────┐     ┌───────────────────────────────────────────────┐
│   React + Vite   │────▶│          Express.js (TypeScript)              │
│   (Frontend)     │◀────│              Backend API                      │
│   Port: 5173     │     │              Port: 8080                       │
└──────────────────┘     │                                               │
                         │  ┌─────────────┐     ┌──────────────────┐    │
                         │  │   MySQL 8    │     │   MongoDB 6      │    │
                         │  │ (Prisma ORM) │     │  (Mongoose ODM)  │    │
                         │  │  Port: 3306  │     │   Port: 27017    │    │
                         │  └─────────────┘     └──────────────────┘    │
                         └───────────────────────────────────────────────┘
```

## ฐานข้อมูล (Databases)

### MySQL — Relational Database (Prisma ORM)
จัดเก็บข้อมูลที่มีความสัมพันธ์ชัดเจน:

| Table | หน้าที่ | CRUD |
|---|---|---|
| **users** | ข้อมูลผู้ใช้ (email, password, role) | ✅ Create / Read / Update / Delete |
| **courses** | รายวิชา (code, title, credits) | ✅ Create / Read / Update / Delete |
| **enrollments** | การลงทะเบียนเรียน (user ↔ course) | ✅ Create / Read / Update / Delete |

```sql
-- MySQL Schema
users (id, email, password_hash, full_name, role, is_deleted, created_at, updated_at)
courses (id, code, title, description, credits, is_deleted, created_at, updated_at)
enrollments (id, user_id FK, course_id FK, status, grade, credits_earned, is_deleted, enrolled_at, completed_at)
```

### MongoDB — NoSQL Document Database (Mongoose ODM)
จัดเก็บข้อมูลแบบ Document ที่มี nested structure:

| Collection | หน้าที่ | CRUD |
|---|---|---|
| **study_plans** | แผนการเรียน + หมวดหน่วยกิต (nested array) | ✅ Create / Read / Update / Delete |
| **completed_courses** | วิชาที่เรียนจบแล้ว + หมวดหมู่ | ✅ Create / Read / Update / Delete |

```javascript
// MongoDB Document Structure
StudyPlan {
  studentId, program, version,
  categories: [{ name, requiredCredits }],  // Nested subdocuments
  isDeleted, deletedAt
}

CompletedCourse {
  studentId, courseId, courseName,
  category, credits, grade, term,
  isDeleted
}
```

### บทบาทของแต่ละฐานข้อมูล
- **MySQL**: จัดการข้อมูลเชิงสัมพันธ์ (Users ↔ Courses ↔ Enrollments) ที่ต้องการ referential integrity
- **MongoDB**: จัดการข้อมูลแบบ Document ที่มี nested structure (study plans กับ categories array, completed courses) ที่เหมาะกับ flexible schema

## วิธีรันโปรเจกต์

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm

### วิธีที่ 1: ใช้ Docker Compose (แนะนำ)

```bash
# Clone repository
git clone <repo-url>
cd CollegeEnrollmentPlatform

# Start backend + databases
docker compose up -d

# Start frontend (แยก terminal)
cd frontend
npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger API Docs**: http://localhost:8080/docs

### วิธีที่ 2: รันแยก

```bash
# 1. Start MySQL & MongoDB (Docker)
docker compose up mysql mongo -d

# 2. Start Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 3. Start Frontend (แยก terminal)
cd frontend
npm install
npm run dev
```

## ฟีเจอร์หลัก

### MongoDB Side (Credit Tracking)
- 📊 **Dashboard** — ภาพรวมหน่วยกิตสะสม (aggregation จาก MongoDB)
- 📝 **เพิ่มวิชาที่เรียน** — บันทึก completed courses (MongoDB CRUD)
- 📋 **ดูวิชาที่เหลือ** — แสดงหมวดที่ยังไม่ครบ
- 🗂️ **จัดการ Study Plan** — ตั้งค่าแผนหน่วยกิต Major + GenEd (MongoDB CRUD พร้อม Soft Delete + Restore)

### MySQL Side (Course & Enrollment Management)
- 📚 **จัดการรายวิชา** — เพิ่ม / แก้ไข / ลบ วิชาใน MySQL (Prisma CRUD)
- 🎓 **จัดการลงทะเบียน** — ลงทะเบียน / อัปเดตสถานะ / เกรด / ลบ (Prisma CRUD)
- 👤 **จัดการผู้ใช้** — ดู / แก้ไขชื่อ-Role / ลบ User (Prisma CRUD)

### ระบบอื่นๆ
- 🔐 **Authentication** — Register / Login ด้วย bcrypt + JWT
- 🗑️ **Soft Delete** — ทุก entity รองรับ soft delete (Prisma middleware + Mongoose)
- 📖 **Swagger API Docs** — เอกสาร API อัตโนมัติ
- 🐳 **Docker Compose** — ติดตั้งง่าย 1 คำสั่ง
- ✅ **Zod Validation** — ตรวจสอบข้อมูลทุก endpoint
- 🧪 **Jest Tests** — ทดสอบ study plan soft-delete flow

## เทคโนโลยีที่ใช้

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7 |
| Backend | Express 5, TypeScript |
| MySQL ORM | Prisma |
| MongoDB ODM | Mongoose |
| Auth | bcrypt, JWT |
| Validation | Zod |
| API Docs | Swagger (OpenAPI 3.0) |
| Container | Docker Compose |
| Testing | Jest, Supertest, mongodb-memory-server |

## โครงสร้างโปรเจกต์

```
CollegeEnrollmentPlatform/
├── docker-compose.yml          # MySQL + MongoDB + Backend
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma       # MySQL schema (3 tables)
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── server.ts           # HTTP server
│   │   ├── prismaClient.ts     # Prisma + soft-delete middleware
│   │   ├── swagger.ts          # Swagger setup
│   │   ├── config/             # DB connections
│   │   ├── models/             # Mongoose models (StudyPlan, CompletedCourse)
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes + Swagger docs
│   │   └── utils/              # Auth + Validation helpers
│   └── test/                   # Jest tests
└── frontend/
    ├── package.json
    └── src/
        ├── App.jsx             # Main app + routing
        ├── App.css             # Global styles
        └── components/
            ├── Auth.jsx            # Login / Register
            ├── Dashboard.jsx       # Credit summary
            ├── AddCourse.jsx       # Record completed courses (MongoDB)
            ├── Remaining.jsx       # Remaining credits
            ├── StudyPlan.jsx       # Study plan CRUD (MongoDB)
            ├── CourseManage.jsx    # Course CRUD (MySQL)
            ├── EnrollmentManage.jsx # Enrollment CRUD (MySQL)
            ├── UserManage.jsx      # User CRUD (MySQL)
            └── Sidebar.jsx         # Navigation
```

## API Endpoints

### MySQL (Prisma)
| Method | Path | Description |
|---|---|---|
| POST | `/api/users/register` | Register |
| POST | `/api/users/login` | Login → JWT |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Soft delete user |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:id` | Get course |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Soft delete course |
| GET | `/api/enrollments` | List all enrollments |
| POST | `/api/enrollments` | Create enrollment |
| PUT | `/api/enrollments/:id` | Update enrollment |
| DELETE | `/api/enrollments/:id` | Soft delete enrollment |

### MongoDB (Mongoose)
| Method | Path | Description |
|---|---|---|
| POST | `/api/studyplan` | Create/Update study plan |
| GET | `/api/studyplan/:studentId` | Get study plan |
| DELETE | `/api/studyplan/student/:studentId` | Soft delete plan |
| POST | `/api/studyplan/student/:studentId/restore` | Restore plan |
| POST | `/api/completed-courses` | Add completed course |
| GET | `/api/completed-courses/by-student/:studentId` | List completed |
| PUT | `/api/completed-courses/:id/grade` | Update grade |
| DELETE | `/api/completed-courses/:id` | Soft delete |
| GET | `/api/summary/:studentId` | Credit summary (aggregation) |
