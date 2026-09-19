# CampusCoins

> **Report. Resolve. Earn. Improve.**

[![Phase](https://img.shields.io/badge/Phase-3%20Core%20Complaint%20Management-blue.svg)](docs/architecture.md)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-61DAFB.svg)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933.svg)](backend/)

CampusCoins is a modern college complaint and campus assistance platform where students report real campus issues, track their resolution lifecycle, earn verifiable **CampusCoins** for meaningful contributions, and navigate the campus environment with ease.

---

## 📌 Problem Statement & Core Idea

Traditional college grievance mechanisms often suffer from:
1. **Lack of Transparency**: Complaints fall into a black hole without clear ownership or real-time status tracking.
2. **Duplicate Reporting**: Dozens of students report the same broken projector or water dispenser independently.
3. **Absence of Student Incentive**: Students feel apathy toward campus maintenance because positive engagement is unrecognized.
4. **Disorganized Campus Assistance**: New students struggle with navigating campus facilities, departments, and services.

**CampusCoins addresses this through gamified civic engagement:**
- **Report**: Students capture and submit campus issues with photos, categories, and locations.
- **Resolve**: Department staff receive triaged tickets with SLA metrics and mark them resolved.
- **Earn**: Verified, high-impact contributions award students **CampusCoins** redeemable for college perks, canteen discounts, or campus merchandise.
- **Improve**: Administrations gain visibility into real-time campus health and infrastructure hotspots.

---

## 🚀 Scope Status: Phase 3 — Core Complaint Management System

> [!IMPORTANT]
> **This repository is currently at Phase 3.**
> Phase 3 implements the complete, robust end-to-end complaint lifecycle:
> `Student report + evidence` &rarr; `Admin review / reject (with reason) / assign staff` &rarr; `Staff start work / progress updates / mark resolved (with resolution note)` &rarr; `Student resolution verification / reopen (with reason)`.
> Includes 24 automated lifecycle test cases, cascaded building/floor/room location selectors, full evidence galleries with lightbox modals, and vertical chronological audit timelines.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React.js 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom Dark Theme & Glassmorphism)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Data Fetching**: [@tanstack/react-query](https://tanstack.com/query)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v20+ / v22)
- **Framework**: [Express.js](https://expressjs.com/)
- **Security**: Helmet, CORS, Express Rate Limit
- **Configuration**: Dotenv
- **Live Diagnostics**: `GET /api/health`

### Database & Cloud Services (Prepared for Phase 2)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth (JWT & RBAC)
- **Storage**: Supabase Storage (Issue media)
- **Realtime**: Supabase Realtime (WebSockets)

---

## 📁 Monorepo Project Structure

```text
CampusCoins/
│
├── frontend/                     # React + Vite Client Application
│   ├── src/
│   │   ├── assets/               # Brand assets and SVG badges
│   │   ├── components/           # Reusable atomic UI & layout components
│   │   │   ├── common/           # Button, Input, Select, Modal, Card, Badge, etc.
│   │   │   ├── layout/           # Navbar, Sidebar, Footer, BackendStatusBadge
│   │   │   └── dashboard/        # MetricCard, QuickActionCard
│   │   ├── layouts/              # PublicLayout, StudentLayout, StaffLayout, AdminLayout
│   │   ├── pages/                # LandingPage, Login, Register, Dashboards
│   │   ├── routes/               # AppRoutes & Role-aware ProtectedRoute
│   │   ├── services/             # api.js (Axios) & supabase.js (Client abstraction)
│   │   ├── hooks/                # useAuth, useHealthCheck
│   │   ├── utils/                # Helper utilities and formatters
│   │   ├── constants/            # Mock data, navigation, role constants
│   │   ├── context/              # AuthContext (Mock state & role switching for Phase 1)
│   │   ├── App.jsx               # Application route shell
│   │   ├── main.jsx              # DOM entry point
│   │   └── index.css             # Tailwind directives and glassmorphism styles
│   ├── public/                   # Static web assets
│   ├── .env.example              # Frontend environment template
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── backend/                      # Node.js + Express API Gateway
│   ├── src/
│   │   ├── controllers/          # Request handlers (healthController.js)
│   │   ├── routes/               # API routes (healthRoutes.js, index.js)
│   │   ├── middleware/           # errorHandler, notFoundHandler, rateLimiter
│   │   ├── services/             # supabaseService.js (DB abstraction layer)
│   │   ├── utils/                # apiResponse.js, logger.js
│   │   ├── config/               # env.js, supabase.js
│   │   ├── validators/           # Zod/Joi validation helpers
│   │   └── server.js             # Express app entry point
│   ├── .env.example              # Backend environment template
│   └── package.json
│
├── ai-service/                   # Phase 3 FastAPI AI Microservice
│   └── README.md
│
├── docs/                         # Architectural & Specification Documentation
│   └── architecture.md
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js >= 18.0.0 (Node v20 or v22 recommended)
- npm >= 9.0.0

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Start development server (Port 5000)
npm run dev
```

The backend starts at `http://localhost:5000`. Test the health check:
```bash
curl http://localhost:5000/api/health
```

Expected output:
```json
{
  "success": true,
  "message": "CampusCoins API is running"
}
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment variables
copy .env.example .env

# Start frontend dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Frontend (`frontend/.env.example`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (`backend/.env.example`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🗺️ Development Roadmap

- [x] **Phase 1: Project Foundation**
  - Monorepo structure, dark glassmorphism design system.
  - Reusable component library (Button, Input, Card, Modal, Badge, etc.).
  - Landing page with CSS/SVG mockup & live API status indicator.
  - Auth UI (`/login`, `/register`, role selector, forgot password modal).
  - Role-based dashboard placeholders (`/student/dashboard`, `/staff/dashboard`, `/admin/dashboard`).
  - Express backend with `/api/health`, helmet, cors, rate limiting, and centralized error handling.
- [x] **Phase 2: Core Database & Supabase Integration**
  - PostgreSQL schema creation (Complaints, Profiles, Wallets, Departments, Locations).
  - Supabase Auth (Sign Up, Sign In, Session management, Row Level Security, RBAC).
  - Seed datasets and profiles.
- [x] **Phase 3: Core Complaint Management System** *(Completed)*
  - Complete complaint lifecycle: Submit &rarr; Admin Review / Reject / Assign &rarr; Staff In Progress & Progress Notes & Resolve &rarr; Student Verify / Reopen.
  - Cascading location selector (Building &rarr; Floor &rarr; Room + General Location fallback).
  - Evidence upload (images &le; 5MB, PDF &le; 10MB, video &le; 25MB) with preview lightbox.
  - Vertical chronological audit trail and status timeline.
  - Strict server-side RBAC guards and state machine validator (`ALLOWED_TRANSITIONS`).
  - 24-case automated lifecycle test suite (`node test/complaintLifecycle.test.js` &rarr; 24/24 Passed).
- [ ] **Phase 4: Campus Navigation Engine**
  - OpenStreetMap & MapLibre integration.
  - Dijkstra/A* pathfinding between college blocks and reported incidents.
- [ ] **Phase 5: Gamification, Wallet & Bounties**
  - Coin transaction ledger, leaderboard, reward redemption shop.

---

## 🧪 Automated Testing

To run the end-to-end complaint lifecycle test suite:

```bash
cd backend
node test/complaintLifecycle.test.js
```

All 24 test cases will validate creation, validation constraints, admin rejection reasons, staff assignments, work order progress notes, resolution comments, student verification, student reopening reasons, IDOR security, and illegal state transitions.
