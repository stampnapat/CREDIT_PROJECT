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
| Swagger API Docs | http://localhost:8080/docs |
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
- 🔐 **Authentication** — Register / Login ด้วย bcrypt + JWT + Demo Login
- 🗑️ **Soft Delete** — ทุก entity ทั้ง MySQL (Prisma middleware) + MongoDB (isDeleted field)
- ♻️ **Restore** — Study Plan สามารถกู้คืนหลัง soft delete ได้
- 📖 **Swagger API Docs** — เอกสาร API อัตโนมัติ (OpenAPI 3.0)
- 🐳 **Docker Compose** — รันทั้งระบบ 1 คำสั่ง (API + MySQL + MongoDB)
- ✅ **Zod Validation** — ตรวจสอบข้อมูล input ทุก endpoint
- 🧪 **Jest Tests** — ทดสอบ study plan soft-delete flow (mongodb-memory-server)
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
│   │   │   ├── mysql.ts            # MySQL connection config
│   │   │   └── mongo.ts            # MongoDB connection (Mongoose)
│   │   ├── models/                 # Mongoose schemas
│   │   │   ├── StudyPlan.ts        # study_plans collection
│   │   │   └── CompletedCourse.ts  # completed_courses collection
│   │   ├── controllers/            # Request handlers (5 controllers)
│   │   ├── services/               # Business logic
│   │   │   ├── summary.service.ts  # Credit aggregation (MongoDB)
│   │   │   ├── coursesService.ts   # Course CRUD (Prisma)
│   │   │   ├── enrollmentsService.ts # Enrollment CRUD (Prisma)
│   │   │   └── usersService.ts     # User CRUD (Prisma)
│   │   ├── routes/                 # API routes + Swagger JSDoc (9 routers)
│   │   └── utils/
│   │       ├── auth.ts             # JWT + bcrypt helpers
│   │       └── validation.ts       # Zod schemas
│   └── test/
│       └── studyplan.test.ts       # Jest test — soft delete flow
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
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/users/register` | สมัครสมาชิก (bcrypt hash) |
| `POST` | `/api/users/login` | เข้าสู่ระบบ → JWT token |
| `GET` | `/api/users` | รายชื่อผู้ใช้ทั้งหมด |
| `GET` | `/api/users/:id` | ข้อมูลผู้ใช้ตาม ID |
| `PUT` | `/api/users/:id` | แก้ไขชื่อ / Role |
| `DELETE` | `/api/users/:id` | Soft delete ผู้ใช้ |
| `GET` | `/api/courses` | รายวิชาทั้งหมด |
| `GET` | `/api/courses/:id` | รายวิชาตาม ID |
| `POST` | `/api/courses` | เพิ่มรายวิชา |
| `PUT` | `/api/courses/:id` | แก้ไขรายวิชา |
| `DELETE` | `/api/courses/:id` | Soft delete รายวิชา |
| `GET` | `/api/enrollments` | การลงทะเบียนทั้งหมด |
| `POST` | `/api/enrollments` | ลงทะเบียนเรียน |
| `PUT` | `/api/enrollments/:id` | อัปเดตสถานะ / เกรด |
| `DELETE` | `/api/enrollments/:id` | Soft delete การลงทะเบียน |

### MongoDB (Mongoose) — 9 endpoints
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/studyplan` | สร้าง/อัปเดต study plan |
| `GET` | `/api/studyplan/:studentId` | ดู study plan |
| `DELETE` | `/api/studyplan/student/:studentId` | Soft delete plan |
| `POST` | `/api/studyplan/student/:studentId/restore` | ♻️ Restore plan |
| `POST` | `/api/completed-courses` | เพิ่มวิชาที่เรียนจบ |
| `GET` | `/api/completed-courses/by-student/:studentId` | รายวิชาที่เรียนจบ |
| `PUT` | `/api/completed-courses/:id/grade` | อัปเดตเกรด |
| `DELETE` | `/api/completed-courses/:id` | Soft delete วิชา |
| `GET` | `/api/summary/:studentId` | 📊 สรุปหน่วยกิต (aggregation) |

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
npm test
```

ทดสอบ Study Plan soft-delete flow ด้วย **Jest** + **mongodb-memory-server** (in-memory MongoDB):
- ✅ Create study plan
- ✅ Soft delete (isDeleted = true, deletedAt set)
- ✅ Restore (isDeleted = false, deletedAt = null)

---

## 👨‍💻 พัฒนาโดย

โปรเจกต์นี้เป็นส่วนหนึ่งของวิชา **01204351 Database Systems**  
มหาวิทยาลัยเกษตรศาสตร์ ภาคปลาย ปีการศึกษา 2568
