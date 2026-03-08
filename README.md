# 🎓 KU Credit Tracker — College Enrollment Platform

> ระบบเช็คหน่วยกิต & แผนการเรียน สำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์  
> โปรเจกต์วิชา **01204351 Database Systems** — Dual-Database (MySQL + MongoDB)

---

## 📐 สถาปัตยกรรมระบบ (System Architecture)

```
┌──────────────────────┐      ┌──────────────────────────────────────────────┐
│    React 19 + Vite   │─────▶│         Express 5 (TypeScript)               │
│      (Frontend)      │◀─────│            Backend API                       │
│    Port: 5173/5174   │      │            Port: 8080                        │
└──────────────────────┘      │                                              │
                              │  ┌──────────────┐    ┌──────────────────┐   │
                              │  │   MySQL 8     │    │   MongoDB 6      │   │
                              │  │  Prisma ORM   │    │  Mongoose ODM    │   │
                              │  │  Port: 3307   │    │  Port: 27017     │   │
                              │  │  3 Tables     │    │  2 Collections   │   │
                              │  └──────────────┘    └──────────────────┘   │
                              └──────────────────────────────────────────────┘
```

---

## 🗄️ ฐานข้อมูล (Databases)

### MySQL — Relational Database (Prisma ORM)
จัดเก็บข้อมูลเชิงสัมพันธ์ที่ต้องการ **referential integrity** (Foreign Key):

| Table | หน้าที่ | CRUD | Soft Delete |
|---|---|---|---|
| **users** | ข้อมูลผู้ใช้ (email, password, role) | ✅ C / R / U / D | ✅ `is_deleted` |
| **courses** | รายวิชา (code, title, credits) | ✅ C / R / U / D | ✅ `is_deleted` |
| **enrollments** | การลงทะเบียนเรียน (user ↔ course) | ✅ C / R / U / D | ✅ `is_deleted` |

```sql
-- MySQL Schema (Prisma)
users        (id PK, email UNIQUE, password_hash, full_name, role ENUM, is_deleted, created_at, updated_at)
courses      (id PK, code UNIQUE, title, description, credits, is_deleted, created_at, updated_at)
enrollments  (id PK, user_id FK→users, course_id FK→courses, status ENUM, grade, credits_earned,
              is_deleted, enrolled_at, completed_at, UNIQUE(user_id, course_id))
```

**ความสัมพันธ์:**
- `users` 1 ──→ N `enrollments` (one-to-many)
- `courses` 1 ──→ N `enrollments` (one-to-many)
- `enrollments` = ตาราง junction ที่เชื่อม users กับ courses (unique constraint บน user_id + course_id)

### MongoDB — NoSQL Document Database (Mongoose ODM)
จัดเก็บข้อมูลแบบ **Document** ที่มี nested structure เหมาะกับ flexible schema:

| Collection | หน้าที่ | CRUD | Soft Delete | Restore |
|---|---|---|---|---|
| **study_plans** | แผนการเรียน + หมวดหน่วยกิต (nested array) | ✅ C / R / U / D | ✅ `isDeleted` + `deletedAt` | ✅ |
| **completed_courses** | วิชาที่เรียนจบ + หมวดหมู่ + เกรด | ✅ C / R / U / D | ✅ `isDeleted` | — |

```javascript
// MongoDB Document Structure
StudyPlan {
  studentId,              // String (unique, indexed)
  program,                // String — ชื่อหลักสูตร
  version,                // String — ปีหลักสูตร
  categories: [           // ← Nested subdocuments (embedded array)
    { name: "Major",                         requiredCredits: 45 },
    { name: "Wellness",                      requiredCredits: 3  },
    { name: "Entrepreneurship",              requiredCredits: 3  },
    { name: "Language and Communication",    requiredCredits: 6  },
    { name: "Thai Citizen and Global Citizen", requiredCredits: 3 },
    { name: "Aesthetics",                    requiredCredits: 3  }
  ],
  isDeleted, deletedAt    // Soft delete fields
}

CompletedCourse {
  studentId,              // String (indexed)
  courseId, courseName,   // รหัสวิชา + ชื่อวิชา
  category,               // ต้องตรงกับ categories ใน StudyPlan
  credits, grade, term,   // หน่วยกิต, เกรด, เทอม
  isDeleted               // Soft delete
}
```

### 🎯 หมวดหน่วยกิต (Credit Categories)

| หมวด | ชื่อใน DB | Icon | ตัวอย่าง credits |
|---|---|---|---|
| **🎓 วิชาเอก (Major)** | `Major` | 🎓 | 45 หน่วยกิต |
| **📚 ศึกษาทั่วไป (GenEd)** | | | |
| ↳ กลุ่มสุขภาวะ | `Wellness` | 🏃 | 3 หน่วยกิต |
| ↳ กลุ่มผู้ประกอบการ | `Entrepreneurship` | 💼 | 3 หน่วยกิต |
| ↳ กลุ่มภาษาและการสื่อสาร | `Language and Communication` | 🗣️ | 6 หน่วยกิต |
| ↳ กลุ่มพลเมืองไทยและพลเมืองโลก | `Thai Citizen and Global Citizen` | 🌏 | 3 หน่วยกิต |
| ↳ กลุ่มสุนทรียศาสตร์ | `Aesthetics` | 🎨 | 3 หน่วยกิต |

### บทบาทของแต่ละฐานข้อมูล
| | MySQL (Prisma) | MongoDB (Mongoose) |
|---|---|---|
| **เหมาะกับ** | ข้อมูลเชิงสัมพันธ์ที่ต้องการ FK | ข้อมูลแบบ Document ที่มี nested array |
| **จุดเด่น** | Referential integrity, JOIN, UNIQUE constraint | Flexible schema, embedded subdocuments |
| **ข้อมูล** | Users ↔ Courses ↔ Enrollments | Study Plans (categories[]), Completed Courses |
| **Soft Delete** | Prisma middleware (`is_deleted`) | Mongoose field (`isDeleted` + `deletedAt`) |

---

## 🚀 วิธีรันโปรเจกต์

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- npm

### วิธีที่ 1: ใช้ Docker Compose (แนะนำ)

```bash
# Clone repository
git clone <repo-url>
cd CollegeEnrollmentPlatform

# Start backend + databases (MySQL + MongoDB + Express API)
docker compose up -d

# Start frontend (แยก terminal)
cd frontend
npm install
npm run dev
```

### วิธีที่ 2: รันแยก (Development)

```bash
# 1. Start MySQL & MongoDB via Docker
docker compose up mysql mongo -d

# 2. Start Backend
cd backend
npm install
cp .env.example .env       # ตั้งค่า DATABASE_URL, MONGO_URI
npx prisma migrate dev     # สร้างตาราง MySQL
npx prisma db seed         # Seed ข้อมูลเริ่มต้น
npm run dev                # ts-node-dev → port 8080

# 3. Start Frontend (แยก terminal)
cd frontend
npm install
npm run dev                # Vite → port 5173/5174
```

### 🔗 URLs
| Service | URL |
|---|---|
| Frontend | http://localhost:5173 (หรือ 5174) |
| Backend API | http://localhost:8080 |
| Swagger API Docs | http://localhost:8080/api-docs |
| MySQL | `localhost:3307` (user: root / pass: root) |
| MongoDB | `localhost:27017` (database: college_progress) |

---

## ✨ ฟีเจอร์หลัก

### 📊 MongoDB Side — ระบบติดตามหน่วยกิต (Credit Tracking)
| หน้า | ฟีเจอร์ | Database |
|---|---|---|
| 📊 **Dashboard** | ภาพรวมหน่วยกิตสะสม — Donut chart, Pie chart, Bar chart (แยก Major + GenEd) | MongoDB aggregation |
| 📝 **เพิ่มวิชาที่เรียน** | บันทึก completed courses — เลือกวิชาจาก MySQL, ระบุหมวด (Major/GenEd), เกรด | MongoDB CRUD |
| 📋 **ดูวิชาที่เหลือ** | แสดงหมวดที่ยังเรียนไม่ครบ — progress bar, แยก Major vs GenEd | MongoDB aggregation |
| 🎯 **จัดการ Study Plan** | สร้าง/แก้ไข/ลบ/กู้คืน แผนหน่วยกิต (Major + 5 GenEd) + JSON preview | MongoDB CRUD + Soft Delete + Restore |

### 🗄️ MySQL Side — ระบบจัดการรายวิชา (Course & Enrollment Management)
| หน้า | ฟีเจอร์ | Database |
|---|---|---|
| 📚 **จัดการรายวิชา** | เพิ่ม / แก้ไข / ลบ วิชา (code, title, credits) | MySQL CRUD (Prisma) |
| ✏️ **จัดการลงทะเบียน** | ลงทะเบียน / อัปเดตสถานะ (NOT_STARTED→IN_PROGRESS→COMPLETED) / เกรด / ลบ | MySQL CRUD (Prisma) |
| 👤 **จัดการผู้ใช้** | ดู / แก้ไขชื่อ-Role (STUDENT/INSTRUCTOR/ADMIN) / ลบ | MySQL CRUD (Prisma) |

### 🔧 ระบบเสริม
- 🔐 **Authentication** — Login ด้วย bcrypt + JWT (auto-register) + JWT middleware ป้องกัน routes
- 🛡️ **Authorization** — Admin-only access สำหรับหน้า MySQL management
- 🗑️ **Soft Delete** — ทุก entity ทั้ง MySQL (Prisma middleware) + MongoDB (isDeleted field)
- ♻️ **Restore** — Study Plan สามารถกู้คืนหลัง soft delete ได้
- 📖 **Swagger API Docs** — เอกสาร API อัตโนมัติ (OpenAPI 3.0)
- 🐳 **Docker Compose** — รันทั้งระบบ 1 คำสั่ง (API + MySQL + MongoDB)
- ✅ **Zod Validation** — ตรวจสอบข้อมูล input ทุก endpoint
- 🧪 **Jest Tests** — 4 test suites, 32 test cases ครอบคลุม MongoDB CRUD + Soft Delete + Auth (mongodb-memory-server)
- 🎨 **UI Design System** — KU Green theme, Recharts, animations, glassmorphism

---

## 🛠️ เทคโนโลยีที่ใช้

| Layer | Technology | Version |
|---|---|---|
| Frontend | React + Vite | 19 + 7.3 |
| Charts | Recharts | 3.7 |
| Backend | Express + TypeScript | 5 |
| MySQL ORM | Prisma | 5.22 |
| MongoDB ODM | Mongoose | 9.2 |
| Auth | bcrypt + jsonwebtoken | 6 + 9 |
| Validation | Zod | 4.3 |
| API Docs | swagger-jsdoc + swagger-ui-express | 6.2 + 5.0 |
| Container | Docker Compose | — |
| Testing | Jest + Supertest + mongodb-memory-server | — |

---

## 📁 โครงสร้างโปรเจกต์

```
CollegeEnrollmentPlatform/
├── docker-compose.yml              # 3 services: api + mysql + mongo
├── README.md
│
├── backend/
│   ├── Dockerfile                  # Multi-stage Node.js 20 image
│   ├── docker-entrypoint.sh        # Auto prisma migrate + seed
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # MySQL schema — 3 tables, 2 enums
│   │   └── seed.ts                 # Seed data (demo users, courses)
│   ├── src/
│   │   ├── app.ts                  # Express app setup + middleware
│   │   ├── server.ts               # HTTP server bootstrap
│   │   ├── prismaClient.ts         # Prisma client + soft-delete middleware
│   │   ├── swagger.ts              # Swagger/OpenAPI setup
│   │   ├── config/
│   │   │   └── mongo.ts            # MongoDB connection (Mongoose)
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts   # JWT authentication + admin-only guard
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── StudyPlan.ts        # study_plans collection
│   │   │   └── CompletedCourse.ts  # completed_courses collection
│   │   ├── controllers/            # Request handlers (3 controllers)
│   │   ├── services/               # Business logic
│   │   │   ├── summary.service.ts  # Credit aggregation (MongoDB)
│   │   │   ├── coursesService.ts   # Course CRUD (Prisma)
│   │   │   ├── enrollmentsService.ts # Enrollment CRUD (Prisma)
│   │   │   └── usersService.ts     # User CRUD (Prisma)
│   │   ├── routes/                 # API routes + Swagger JSDoc (7 routers)
│   │   └── utils/
│   │       ├── auth.ts             # JWT + bcrypt helpers
│   │       └── validation.ts       # Zod schemas
│   └── test/
│       ├── helpers.ts               # Test utilities — JWT token helpers
│       ├── studyplan.test.ts       # Study Plan CRUD + soft delete + restore (10 tests)
│       ├── completedCourse.test.ts # Completed Course CRUD + soft delete (12 tests)
│       ├── summary.test.ts         # Credit aggregation + edge cases (7 tests)
│       └── demo.test.ts            # Demo reset seeding (3 tests)
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx                 # Main app — routing + state management
        ├── App.css                 # Design system (~815 lines) — KU Green theme
        ├── index.css               # CSS reset
        ├── main.jsx                # React entry point
        └── components/
            ├── Auth.jsx            # 🔐 Login / Register / Demo Login
            ├── Sidebar.jsx         # 📌 Navigation — 2 sections (Core + MySQL)
            ├── Dashboard.jsx       # 📊 Credit summary — charts + category grouping
            ├── AddCourse.jsx       # 📝 Record completed courses (MongoDB CRUD)
            ├── Remaining.jsx       # 📋 Remaining credits — progress bars
            ├── StudyPlan.jsx       # 🎯 Study plan CRUD + soft delete + restore
            ├── CourseManage.jsx    # 📚 Course CRUD (MySQL/Prisma)
            ├── EnrollmentManage.jsx # ✏️ Enrollment CRUD (MySQL/Prisma)
            └── UserManage.jsx      # 👤 User CRUD (MySQL/Prisma)
```

---

## 🌐 API Endpoints

### MySQL (Prisma) — 15 endpoints
| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/users/register` | สมัครสมาชิก (bcrypt hash) | 🔓 Public |
| `POST` | `/api/users/login` | เข้าสู่ระบบ → JWT token | 🔓 Public |
| `GET` | `/api/users` | รายชื่อผู้ใช้ทั้งหมด | 🔓 Public |
| `GET` | `/api/users/:id` | ข้อมูลผู้ใช้ตาม ID | 🔓 Public |
| `PUT` | `/api/users/:id` | แก้ไขชื่อ / Role | 🔓 Public |
| `DELETE` | `/api/users/:id` | Soft delete ผู้ใช้ | 🔓 Public |
| `GET` | `/api/courses` | รายวิชาทั้งหมด | 🔒 JWT |
| `GET` | `/api/courses/:id` | รายวิชาตาม ID | 🔒 JWT |
| `POST` | `/api/courses` | เพิ่มรายวิชา | 🔒 JWT |
| `PUT` | `/api/courses/:id` | แก้ไขรายวิชา | 🔒 JWT |
| `DELETE` | `/api/courses/:id` | Soft delete รายวิชา | 🔒 JWT |
| `GET` | `/api/enrollments` | การลงทะเบียนทั้งหมด | 🔒 JWT |
| `POST` | `/api/enrollments` | ลงทะเบียนเรียน | 🔒 JWT |
| `PUT` | `/api/enrollments/:id` | อัปเดตสถานะ / เกรด | 🔒 JWT |
| `DELETE` | `/api/enrollments/:id` | Soft delete การลงทะเบียน | 🔒 JWT |

### MongoDB (Mongoose) — 12 endpoints
| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/studyplan` | 📋 List all study plans | 🔒 JWT |
| `POST` | `/api/studyplan` | สร้าง/อัปเดต study plan | 🔒 JWT |
| `GET` | `/api/studyplan/:studentId` | ดู study plan | 🔒 JWT |
| `PUT` | `/api/studyplan/:id` | แก้ไข study plan | 🔒 JWT |
| `DELETE` | `/api/studyplan/student/:studentId` | Soft delete plan | 🔒 JWT |
| `POST` | `/api/studyplan/student/:studentId/restore` | ♻️ Restore plan | 🔒 JWT |
| `GET` | `/api/completed-courses` | 📋 List all completed courses | 🔒 JWT |
| `POST` | `/api/completed-courses` | เพิ่มวิชาที่เรียนจบ | 🔒 JWT |
| `GET` | `/api/completed-courses/by-student/:studentId` | รายวิชาที่เรียนจบ | 🔒 JWT |
| `PUT` | `/api/completed-courses/:id` | อัปเดตวิชา (ทุก field) | 🔒 JWT |
| `DELETE` | `/api/completed-courses/:id` | Soft delete วิชา | 🔒 JWT |
| `GET` | `/api/summary/:studentId` | 📊 สรุปหน่วยกิต (aggregation) | 🔒 JWT |

---

## 🎨 UI Design

- **Theme**: KU Green — Emerald/Teal palette (`#1b6b3a`, `#10b981`)
- **Charts**: Recharts (Donut, Pie, Bar) แสดงผลหน่วยกิตแยกตาม Major + GenEd
- **Animations**: fadeUp, slideInLeft, shimmer progress bar, pulse
- **Categories**: แบ่ง 2 กลุ่ม — 🎓 วิชาเอก (Major) + 📚 ศึกษาทั่วไป (GenEd 5 หมวด)
- **Responsive**: Sidebar + Content layout, scrollable tables

---

## 🧪 Testing

```bash
cd backend
npm test                              # รันทุก test
npx jest --runInBand --verbose         # รันพร้อมแสดงรายละเอียด
npx jest --runInBand test/summary.test.ts  # รันแค่ไฟล์เดียว
```

**4 Test Suites — 32 Test Cases** ด้วย **Jest** + **Supertest** + **mongodb-memory-server** (ไม่ต้องเปิด Docker):

| Test File | Tests | ทดสอบ |
|---|---|---|
| `studyplan.test.ts` | 10 | Create, Read, List All, Upsert/Update, Soft Delete, Restore, Auth JWT |
| `completedCourse.test.ts` | 12 | Create, List All, Read by Student, Full Update, Grade Update, Soft Delete, Auth JWT |
| `summary.test.ts` | 7 | Credit aggregation ข้ามคอลเลกชัน, per-category progress, edge cases, Auth JWT |
| `demo.test.ts` | 3 | Demo reset seeding, custom studentId, overwrite prevention |

---

## � Quick Test — curl examples

ทดสอบ CRUD ได้เร็วด้วย curl (ต้อง `docker compose up -d` ก่อน):

### 1. Login → ได้ JWT token

```bash
# Register + Login (auto-create ถ้ายังไม่มี user)
curl -s -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ku.th","password":"demo1234"}' | jq .

# เก็บ token ไว้ใช้ต่อ
TOKEN=$(curl -s -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ku.th","password":"demo1234"}' | jq -r '.token')
```

### 2. MySQL CRUD — Courses

```bash
# CREATE course
curl -s -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"code":"CS101","title":"Programming I","credits":3}' | jq .

# READ all courses
curl -s http://localhost:8080/api/courses \
  -H "Authorization: Bearer $TOKEN" | jq .

# UPDATE course (id=1)
curl -s -X PUT http://localhost:8080/api/courses/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Programming Fundamentals","credits":4}' | jq .

# DELETE course — soft delete (id=1)
curl -s -X DELETE http://localhost:8080/api/courses/1 \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 3. MySQL CRUD — Enrollments

```bash
# CREATE enrollment
curl -s -X POST http://localhost:8080/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"userId":1,"courseId":1}' | jq .

# READ all enrollments
curl -s http://localhost:8080/api/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq .

# UPDATE enrollment status + grade (id=1)
curl -s -X PUT http://localhost:8080/api/enrollments/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"COMPLETED","grade":"A","creditsEarned":3}' | jq .

# DELETE enrollment — soft delete (id=1)
curl -s -X DELETE http://localhost:8080/api/enrollments/1 \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 4. MySQL CRUD — Users

```bash
# READ all users
curl -s http://localhost:8080/api/users | jq .

# UPDATE user (id=1)
curl -s -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Demo Student","role":"STUDENT"}' | jq .

# DELETE user — soft delete (id=1)
curl -s -X DELETE http://localhost:8080/api/users/1 | jq .
```

### 5. MongoDB CRUD — Study Plans

```bash
# CREATE study plan
curl -s -X POST http://localhost:8080/api/studyplan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId":"demo@ku.th",
    "program":"Computer Science",
    "version":"2026",
    "categories":[
      {"name":"Major","requiredCredits":45},
      {"name":"Wellness","requiredCredits":3}
    ]
  }' | jq .

# READ study plan
curl -s http://localhost:8080/api/studyplan/demo@ku.th \
  -H "Authorization: Bearer $TOKEN" | jq .

# READ all study plans
curl -s http://localhost:8080/api/studyplan \
  -H "Authorization: Bearer $TOKEN" | jq .

# UPDATE (upsert — POST same studentId with new data)
curl -s -X POST http://localhost:8080/api/studyplan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId":"demo@ku.th",
    "program":"Software Engineering",
    "version":"2026",
    "categories":[{"name":"Major","requiredCredits":60}]
  }' | jq .

# DELETE study plan — soft delete
curl -s -X DELETE http://localhost:8080/api/studyplan/student/demo@ku.th \
  -H "Authorization: Bearer $TOKEN" | jq .

# RESTORE study plan
curl -s -X POST http://localhost:8080/api/studyplan/student/demo@ku.th/restore \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 6. MongoDB CRUD — Completed Courses

```bash
# CREATE completed course
curl -s -X POST http://localhost:8080/api/completed-courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentId":"demo@ku.th",
    "courseId":"CS101",
    "courseName":"Programming I",
    "category":"Major",
    "credits":3,
    "grade":"A",
    "term":"1/2026"
  }' | jq .

# READ all completed courses
curl -s http://localhost:8080/api/completed-courses \
  -H "Authorization: Bearer $TOKEN" | jq .

# READ by student
curl -s http://localhost:8080/api/completed-courses/by-student/demo@ku.th \
  -H "Authorization: Bearer $TOKEN" | jq .

# UPDATE completed course (ใช้ _id จาก response ด้านบน)
curl -s -X PUT http://localhost:8080/api/completed-courses/<MONGO_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"grade":"A","credits":4}' | jq .

# DELETE completed course — soft delete
curl -s -X DELETE http://localhost:8080/api/completed-courses/<MONGO_ID> \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 7. MongoDB — Summary (Aggregation)

```bash
# Credit summary — aggregates study_plan + completed_courses
curl -s http://localhost:8080/api/summary/demo@ku.th \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 8. Demo Reset (seed sample data)

```bash
curl -s -X POST http://localhost:8080/api/demo/reset \
  -H "Content-Type: application/json" \
  -d '{"studentId":"S001"}' | jq .
```

---

## �👨‍💻 พัฒนาโดย

โปรเจกต์นี้เป็นส่วนหนึ่งของวิชา **01204351 Database Systems**  
มหาวิทยาลัยเกษตรศาสตร์ ภาคปลาย ปีการศึกษา 2568
