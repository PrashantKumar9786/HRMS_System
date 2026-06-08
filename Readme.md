# HRMS — Human Resource Management System

> Full-Stack Developer Assignment | Node.js · React · PostgreSQL · Prisma

**Live Demo:** https://hrms-system-two.vercel.app
---

## Overview

HRMS is a full-stack Human Resource Management System that allows organisations to manage employees, teams, and their assignments. It features JWT-based authentication, complete CRUD operations, multi-team employee assignment, and a full audit log of all system activity stored in both the database and a log file.

---

## Tech Stack

### Backend

| Technology        | Package                     | Purpose                           |
| ----------------- | --------------------------- | --------------------------------- |
| Node.js + Express | `express`                   | REST API server                   |
| Prisma ORM        | `@prisma/client`            | Database interactions             |
| PostgreSQL        | `pg` + `@prisma/adapter-pg` | Relational database               |
| JWT               | `jsonwebtoken`              | Authentication tokens             |
| bcryptjs          | `bcryptjs`                  | Password hashing (cost factor 12) |
| Winston           | `winston`                   | File + console logging            |
| express-validator | `express-validator`         | Input validation                  |

### Frontend

| Technology     | Package                 | Purpose                       |
| -------------- | ----------------------- | ----------------------------- |
| React + Vite   | `react`, `vite`         | UI framework                  |
| React Router   | `react-router-dom`      | Client-side routing           |
| TanStack Query | `@tanstack/react-query` | Server state + caching        |
| Zustand        | `zustand`               | Auth state management         |
| Axios          | `axios`                 | HTTP client with interceptors |
| Tailwind CSS   | `tailwindcss`           | Utility-first styling         |

---

## Database Schema

Fully normalised schema with UUID primary keys, foreign key constraints, cascade deletes, and a junction table for the many-to-many Employee↔Team relationship.

```
Organisation
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   (bcrypt hashed)

Employee
  id        String   @id @default(uuid())
  name      String
  email     String
  role      String
  orgId     String   → Organisation

Team
  id        String   @id @default(uuid())
  name      String
  orgId     String   → Organisation

TeamEmployee  (junction table — many-to-many)
  employeeId  String  → Employee  @@id([employeeId, teamId])
  teamId      String  → Team

Log
  id        String   @id @default(uuid())
  orgId     String   → Organisation
  action    String
  createdAt DateTime
```

---

## Project Structure

```
HRMS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── employee.controller.js
│   │   │   ├── team.controller.js
│   │   │   └── log.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── employee.routes.js
│   │   │   ├── team.routes.js
│   │   │   └── log.routes.js
│   │   ├── services/
│   │   │   └── log.service.js     # Dual logging (DB + file)
│   │   └── utils/
│   │       ├── logger.js          # Winston logger
│   │       └── prisma.js          # Prisma client singleton
│   ├── generated/prisma/          # Auto-generated Prisma client
│   ├── logs/app.log               # Winston log file
│   ├── prisma.config.ts
│   ├── .env
│   └── package.json
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js           # Axios instance + interceptors
        ├── components/
        │   ├── Layout.jsx         # Sidebar + routing shell
        │   ├── Modal.jsx
        │   └── Input.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Employees.jsx      # List + CRUD
        │   ├── Teams.jsx          # List + CRUD
        │   ├── TeamDetail.jsx     # Member assignment
        │   └── Logs.jsx           # Audit trail
        └── store/
            └── authStore.js       # Zustand auth state
```

---

## Local Setup

### Prerequisites

- Node.js v18+
- PostgreSQL running locally
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/PrashantKumar9786/HRMS_System.git
cd HRMS_System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/hrms"
JWT_SECRET="your_long_random_secret_here"
PORT=5000
```

Run migrations and start server:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Endpoints

### Authentication

| Method | Endpoint             | Auth | Description               |
| ------ | -------------------- | ---- | ------------------------- |
| POST   | `/api/auth/register` | No   | Register new organisation |
| POST   | `/api/auth/login`    | No   | Login, returns JWT token  |
| POST   | `/api/auth/logout`   | Yes  | Logout + write audit log  |

### Employees

| Method | Endpoint             | Auth | Description                   |
| ------ | -------------------- | ---- | ----------------------------- |
| GET    | `/api/employees`     | Yes  | List all employees with teams |
| GET    | `/api/employees/:id` | Yes  | Get single employee           |
| POST   | `/api/employees`     | Yes  | Create employee               |
| PUT    | `/api/employees/:id` | Yes  | Update employee               |
| DELETE | `/api/employees/:id` | Yes  | Delete employee               |

### Teams

| Method | Endpoint                       | Auth | Description                 |
| ------ | ------------------------------ | ---- | --------------------------- |
| GET    | `/api/teams`                   | Yes  | List all teams with members |
| GET    | `/api/teams/:id`               | Yes  | Get single team             |
| POST   | `/api/teams`                   | Yes  | Create team                 |
| PUT    | `/api/teams/:id`               | Yes  | Update team                 |
| DELETE | `/api/teams/:id`               | Yes  | Delete team                 |
| POST   | `/api/teams/:id/assign`        | Yes  | Assign employee to team     |
| DELETE | `/api/teams/:id/assign/:empId` | Yes  | Remove employee from team   |

### Logs

| Method | Endpoint    | Auth | Description                    |
| ------ | ----------- | ---- | ------------------------------ |
| GET    | `/api/logs` | Yes  | Get last 100 audit log entries |

---

## Security

- Passwords hashed with **bcrypt** at cost factor 12
- **JWT tokens** with 30 days expiry
- All routes except `/auth/*` require a valid JWT via middleware
- **Organisation-level data scoping** — every DB query filters by `orgId`, making cross-tenant access architecturally impossible
- Input validation on all POST/PUT routes via `express-validator`
- Passwords never returned in API responses (Prisma `select` excludes them)
- CORS restricted to known frontend origins only

---

## Logging & Audit Trail

Every state-changing operation writes to two places simultaneously:

- **Database** (`Log` table) — org-scoped, queryable, shown in the UI
- **File** (`logs/app.log`) — persistent, formatted with Winston

**Log format:**

```
[2026-06-07 15:20:50] [INFO] User 'admin@company.com' logged in.
[2026-06-07 15:21:05] [INFO] User 'admin@company.com' added new employee 'John Doe'.
[2026-06-07 15:21:20] [INFO] User 'admin@company.com' created new team 'Engineering'.
[2026-06-07 15:21:35] [INFO] User 'admin@company.com' assigned 'John Doe' to team 'Engineering'.
[2026-06-07 15:22:00] [INFO] User 'admin@company.com' updated employee 'John Doe'.
[2026-06-07 15:22:30] [INFO] User 'admin@company.com' deleted employee 'John Doe'.
[2026-06-07 15:23:00] [INFO] User 'admin@company.com' logged out.
```

**Logged events:**

- User login / logout
- Employee created / updated / deleted
- Team created / updated / deleted
- Employee assigned to / removed from team

---

## Deployment

| Layer    | Platform          |
| -------- | ----------------- |
| Frontend | Vercel            |
| Backend  | Render            |
| Database | Render PostgreSQL |

---

## Judging Criteria

### Code Architecture

- Clear separation: controllers handle HTTP, services handle business logic, utils are shared tools
- Prisma singleton prevents connection pool exhaustion
- React Query for server state, Zustand for client auth state — no prop drilling
- Protected and public route wrappers enforce authentication at the router level

### Code Optimisation

- Prisma `select` returns only needed fields — no overfetching
- Many-to-many resolved at DB level, not in application code
- React Query caches responses and invalidates on mutation — no redundant API calls
- Cascade deletes handled at DB level via `onDelete: Cascade`

### Security & Logging

- bcrypt cost factor 12 — industry standard
- JWT with expiry — stateless and scalable
- Org-level data isolation prevents cross-tenant access
- Dual logging: database for audit trail UI, file for persistence

### Database Schema Design

- Fully normalised — no data duplication
- UUIDs as primary keys — better for security
- Composite primary key on `TeamEmployee` prevents duplicate assignments
- All foreign keys have `onDelete: Cascade` — no orphaned records

---

## Bonus Points

- Clean dark-mode UI with sidebar navigation, modals, and color-coded audit log badges
- **Prisma ORM** for type-safe DB interactions
- **express-validator** middleware for request validation
- **Winston** for structured, timestamped logs
- **TanStack Query** for intelligent server state caching
- Fully deployed: Vercel + Render
