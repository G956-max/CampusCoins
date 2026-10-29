# CampusCoins

> **Report. Resolve. Earn. Improve.**

[![Tests](https://img.shields.io/badge/Tests-32%20Passed%20%7C%200%20Failed-success.svg)](backend/test/complaintLifecycle.test.js)
[![Frontend Build](https://img.shields.io/badge/Frontend-Vite%20Build%20Passed-success.svg)](frontend/)
[![Theme](https://img.shields.io/badge/Theme-Premium%20Light%20%23168451-green.svg)](frontend/src/index.css)
[![Security](https://img.shields.io/badge/Security-Server%20Verified%20RBAC%20%26%20RLS-blue.svg)](docs/database/migration_complete.sql)

CampusCoins is a modern campus civic platform where students report real university defects, track maintenance transparently, earn verifiable **CampusCoins** on an immutable ledger, and discover campus facilities with an interactive map.

---

## 📌 Problem Statement & Solution

Traditional college grievance mechanisms often suffer from:
1. **Lack of Transparency**: Complaints fall into a black hole without clear ownership or real-time status tracking.
2. **Duplicate Reporting**: Dozens of students report the same broken projector or water dispenser independently.
3. **Absence of Student Incentive**: Students feel apathy toward campus maintenance because positive engagement is unrecognized.
4. **Disorganized Campus Navigation**: Students and visitors struggle with finding facilities and step-free accessible routes.

**CampusCoins addresses this through an incentivized civic ecosystem:**
- **Report**: Students capture and submit campus issues with photos, categories, and building/room selectors, with automatic duplicate warning checks.
- **Resolve**: Department staff receive triaged tickets with SLA timers, post work updates, and attach resolution proof.
- **Earn**: Verified, high-impact contributions award students **CampusCoins** atomically stored on a persistent ledger.
- **Redeem**: Students redeem coins for canteen vouchers, printing passes, and campus benefits, verified securely via single-use QR vouchers.
- **Navigate**: Interactive Leaflet campus map displays live defect pins and Dijkstra shortest-path navigation (including step-free accessible routing).

---

## 🎨 Premium Light Theme Palette

CampusCoins user interface is styled in a clean, modern SaaS light aesthetic:

| Element | Color Hex | Usage |
| :--- | :--- | :--- |
| **Main Background** | `#F7FAF7` | Full-page background |
| **Surface / Cards** | `#FFFFFF` | Cards, panels, modal windows, table containers |
| **Primary Green** | `#168451` | Brand accents, primary buttons, active links, success indicators |
| **Dark Hover Green** | `#116B42` | Button hover and active states |
| **Soft Green Background** | `#EAF6EE` | Accent chips, badges, highlight banners |
| **Primary Text** | `#17211B` | High-contrast headers and body text |
| **Secondary Text** | `#647168` | Subtitles, metadata, timestamps |
| **Border Color** | `#E1E9E2` | Subtle dividers, card borders, table separators |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Centralized Light Design Tokens in `tailwind.config.js`)
- **Routing**: React Router v6
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Maps**: Leaflet + OpenStreetMap (Accessible Dijkstra pathfinding)
- **Charts**: Recharts (Configured with light grid `#E1E9E2` and dark text)
- **QR Codes**: Canvas QR rendering for single-use vouchers

### Mobile Application (React Native & Expo)
- **Framework**: React Native + Expo SDK 58
- **Navigation**: React Navigation v7 (Native Stack & Bottom Tabs)
- **Icons**: Expo Vector Icons (Ionicons)
- **State & Storage**: React Context + `@react-native-async-storage/async-storage`
- **Location**: `mobile/` directory
- **Scripts**: `npm run dev:mobile` / `npm run android:mobile`

### Backend
- **Runtime**: Node.js (v20+ / v22)
- **Framework**: Express.js
- **Security**: Server-side JWT verification, role-based access control, helmet, CORS, express-rate-limit
- **Ledger Engine**: Atomic coin transactions, idempotency guards, and single-use voucher validation

### Database & Supabase Integration
- **Database**: PostgreSQL (Supabase)
- **RLS**: Row-Level Security policies restricting unauthorized balance, XP, or role updates
- **Atomic RPCs**: `award_coins_atomic`, `redeem_reward_atomic`, `claim_mission_atomic`
- **Migration**: Complete database schema and stored procedures located at `docs/database/migration_complete.sql`

---

## 📁 Repository Structure

```text
CampusCoins/
├── docs/
│   ├── database/
│   │   └── migration_complete.sql    # Complete SQL migration (tables, RPCs, RLS, seed data)
│   └── architecture.md               # Technical architecture & security specifications
│
├── frontend/
│   ├── src/
│   │   ├── components/               # Common atomic UI components (Card, Button, Badge, Modal, Input)
│   │   │   ├── complaints/           # Timeline, EvidenceGallery, LocationSelector, StatusBadge
│   │   │   ├── dashboard/            # MetricCard, QuickActionCard
│   │   │   └── layout/               # Navbar, Sidebar, NotificationDropdown, Footer
│   │   ├── pages/
│   │   │   ├── auth/                 # LoginPage, RegisterPage
│   │   │   ├── landing/              # LandingPage
│   │   │   ├── student/              # Dashboard, Complaints, Wallet, Missions, Badges, Leaderboard, Store
│   │   │   ├── staff/                # Dashboard, Work Orders, Detail, StaffVerifyVoucherPage
│   │   │   ├── admin/                # Dashboard, Dispatch, Detail, SLA, Rewards, Redemptions, Gamification
│   │   │   ├── common/               # CampusMapPage (Leaflet), CommunityBountiesPage
│   │   │   └── profile/              # ProfilePage
│   │   ├── services/                 # complaintApi, gamificationApi, notificationApi, mapApi
│   │   └── tailwind.config.js        # Design tokens for #F7FAF7 light theme
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/              # REST endpoint handlers
│   │   ├── services/                 # complaint, coin, mission, reward, duplicate, sla, map, notification
│   │   ├── middleware/               # authMiddleware (disables mock bypass in production)
│   │   └── routes/                   # complaintRoutes, staffRoutes, adminRoutes, gamificationRoutes
│   ├── test/
│   │   └── complaintLifecycle.test.js # 32 automated verification tests
│   └── package.json
│
├── .gitignore                        # Comprehensive secret protection
└── README.md
```

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- Node.js v18 or v20+
- npm v9+
- (Optional for cloud DB) Supabase project or PostgreSQL instance

### 2. Environment Configuration
Copy the template files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend `.env`**:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ALLOW_DEV_MOCK_AUTH=false

# Optional Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 3. Applying Database Migrations
If using Supabase or PostgreSQL:
1. Open the Supabase SQL Editor.
2. Load and execute [`docs/database/migration_complete.sql`](docs/database/migration_complete.sql).
3. The script creates all tables, foreign keys, atomic ledger functions, and RLS policies.

### 4. Running the Application

**Run Backend**:
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

**Run Frontend**:
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Testing & Verification

All critical business rules, security permissions, atomic ledger operations, voucher verification, and duplicate detection routines are verified by automated tests:

```bash
cd backend
npm test
```

**Execution Results**:
```text
============================================================
  FINAL RESULTS: 32 PASSED, 0 FAILED
============================================================
- Suite 1: Health & API Gateway Baseline (2 tests)
- Suite 2: Student Complaint Submission & Validation (5 tests)
- Suite 3: Admin Review, Rejection & Technician Assignment (5 tests)
- Suite 4: Staff Workflow, Updates & Resolution (5 tests)
- Suite 5: Security, IDOR Protection & Role RBAC (3 tests)
- Suite 6: Mission Claim Security & Incomplete Mission Rejection (1 test)
- Suite 7: Reward Redemption, Atomic Coin Deduction & Anti-Reuse Vouchers (4 tests)
- Suite 8: Smart Duplicate Detection, SLA Analytics & CSV Export (7 tests)
```

**Production Build Validation**:
```bash
cd frontend
npm run build
# vite build completed with 0 errors
```

---

## 🛡️ Security Audit & Hardening Summary

1. **Role-Bypass Headers Eliminated**: Client role headers are strictly ignored in production. Authorization is resolved strictly from the verified user session.
2. **Atomic Coin Transactions**: Direct client coin awards are prohibited; coin additions and deductions execute atomically server-side with idempotency guards.
3. **Single-Use Vouchers**: Store redemptions generate unique, signed `VCH-XXXX-XXXX-XXXX` tokens. Once fulfilled by authorized staff, repeated use is blocked.
4. **Mission Claim Validation**: Server queries actual completed complaints rather than trusting client completion flags.
5. **IDOR & Resource Isolation**: Students cannot view or modify tickets raised by other students; staff can only service work orders assigned to their department.
6. **Zero Secrets in Code**: Privileged database tokens are excluded from client bundles and git tracking.
