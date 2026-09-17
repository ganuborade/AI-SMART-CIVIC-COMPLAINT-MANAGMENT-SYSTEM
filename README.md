# 🏛️ AI-Smart Civic Complaint Management System
> **An Intelligent, High-Performance Civic Governance Platform powered by Spring Boot, React, MySQL 8 (HikariCP Connection Pooling), and AI-Assisted Automated Triage.**

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%204.1.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.0%20(HikariCP)-orange.svg)](https://www.mysql.com/)
[![Java](https://img.shields.io/badge/JDK-17%20%7C%2021%20%7C%2026-red.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-Spring%20Security%20%2B%20JWT-yellow.svg)](https://spring.io/projects/spring-security)

---

## 📌 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Innovations & Features](#-key-innovations--features)
3. [Technology Stack](#-technology-stack)
4. [High-Performance Architecture & Connection Pooling](#-high-performance-architecture--connection-pooling)
5. [Database Setup in MySQL Workbench (From Scratch)](#-database-setup-in-mysql-workbench-from-scratch)
6. [Security & Credentials Management (.env)](#-security--credentials-management-env)
7. [Quick Start & One-Click Launch](#-quick-start--one-click-launch)
8. [Pre-Configured Demo Accounts](#-pre-configured-demo-accounts)
9. [REST API Documentation](#-rest-api-documentation)
10. [Presentation & Demonstration Queries](#-presentation--demonstration-queries)

---

## 🌟 Project Overview
Municipal corporations and civic bodies struggle with high complaint volumes, slow categorization, manual departmental routing, lack of photo audit trails, and citizen distrust.

**AI-Smart Civic Complaint Management System** bridges this gap:
- **Citizens** report civic issues (potholes, water leaks, streetlights, garbage, open drains) with GPS geolocation and photographic evidence.
- **Intelligent AI Engine** instantly analyzes images and text descriptions, auto-classifies the category, predicts hazard severity, assigns priority, and suggests the relevant department.
- **Municipal Administrators** monitor the city-wide pulse, assign work orders, and supervise department turnaround times.
- **Department Officers & Field Engineers** receive actionable work orders on their dashboards, dispatch repair teams, and upload **BEFORE/AFTER** resolution evidence.
- **Citizens** track live progress, receive built-in real-time dashboard notifications, and submit star ratings and feedback.

---

## 🚀 Key Innovations & Features

- 🧠 **Dual-Engine AI Triage**:
  - Offline Intelligent Rule & Keyword Heuristic Engine for lightning-fast, zero-cost classification.
  - Optional Google Gemini Live Vision & Multimodal API integration for deep image comprehension.
- ⚡ **High-Performance HikariCP Connection Pooling**:
  - Tuned connection pool (`maximum-pool-size=20`, `minimum-idle=5`) with MySQL JDBC batching (`rewriteBatchedStatements=true`) and client statement caching (`cachePrepStmts=true`).
- 🔔 **In-App Real-Time Notification Dashboard**:
  - Direct database-driven notification center for Citizens and Officers without external email dependencies.
- 📸 **Before & After Proof Verification**:
  - Strict audit trail ensuring complaints cannot be resolved without photographic proof and supervisor remarks.
- 🛡️ **Role-Based Access Control (RBAC)**:
  - Spring Security with BCrypt password hashing and stateless JWT bearer tokens for `CITIZEN`, `EMPLOYEE`, and `ADMIN`.
- 🔄 **Fault-Tolerant Resilient Architecture**:
  - Seamless fallback to an in-memory H2 database in MySQL mode if the local MySQL service is ever stopped during a demonstration.

---

## 💻 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Backend** | Spring Boot 4.1.1 / Java 17+ | Core RESTful API, Security, JPA Services |
| **Database** | MySQL 8.0+ | Relational persistence, constraints, foreign keys |
| **Connection Pool** | HikariCP | Ultra-low latency database connection pooling |
| **ORM** | Hibernate 7 / Spring Data JPA | Batch-optimized relational data mapping |
| **Security** | Spring Security + JJWT 0.12.6 | BCrypt hashing, JWT authentication |
| **Frontend** | React 18 + Vite | Single Page Application (SPA) with Lucide Icons |
| **Styling** | Vanilla CSS Design System | Glassmorphism, animations, responsive layout |
| **Maps & Media** | Leaflet / HTML5 Geolocation | Interactive map pinning and photo uploads |

---

## ⚡ High-Performance Architecture & Connection Pooling

To achieve maximum throughput and withstand peak loads during civic emergencies (e.g. monsoon flooding or power grid failures), the database layer is optimized with industry-standard performance engineering:

1. **HikariCP Connection Pool (`CivicMySQLHikariPool`)**:
   - `maximum-pool-size: 20` – eliminates connection allocation bottlenecks.
   - `minimum-idle: 5` – keeps ready connections primed.
   - `idle-timeout: 300,000ms` (5 minutes) – frees unused resources smoothly.
   - `connection-timeout: 20,000ms` – protects threads from hanging.
   - `max-lifetime: 1,200,000ms` – recycles aged connections before TCP socket timeouts.

2. **MySQL Driver-Level Performance Flags**:
   - `rewriteBatchedStatements=true`: Rewrites multiple JPA `INSERT` queries into high-speed batched multi-row queries over the network (3x to 10x throughput boost).
   - `cachePrepStmts=true` & `prepStmtCacheSize=250`: Caches up to 250 pre-compiled SQL prepared statements per connection.
   - `prepStmtCacheSqlLimit=2048`: Ensures queries up to 2KB stay resident in client cache.
   - `useServerPrepStmts=true`: Offloads query parsing directly to the MySQL database engine.
   - `useLocalSessionState=true`: Avoids redundant round-trip calls to query isolation levels and autocommit states.

3. **Hibernate Batch Optimization**:
   - `hibernate.jdbc.batch_size=25`
   - `hibernate.order_inserts=true`
   - `hibernate.order_updates=true`

4. **Database Indexes**:
   - Foreign keys and frequently queried fields (`citizen_id`, `status`, `category`, `priority`, `created_at DESC`, `employee_id`, `department_id`, `is_read`) are indexed with B-Tree indexes.

---

## 🛠️ Database Setup in MySQL Workbench (From Scratch)

You can set up the entire database from scratch in MySQL Workbench in less than 60 seconds:

### Step 1: Open MySQL Workbench
1. Launch **MySQL Workbench** from your Windows Start Menu.
2. Click on your local MySQL connection (e.g., **Local instance 3306**).
3. Log in with user `root` and password `Roor@123`.

### Step 2: Open and Run the SQL Script
1. In the top menu, go to **File** > **Open SQL Script...** (or press `Ctrl + Shift + O`).
2. Navigate to your project folder and select:
   `civic_db_setup_and_demo_queries.sql`
3. Click the **Execute (Lightning Icon ⚡)** button on the toolbar (or press `Ctrl + Shift + Enter`).
4. Wait 2 seconds for execution to complete. All queries will show green checkmarks in the Action Output console.

### Step 3: Verify the Database
1. In the left **Navigator** panel under **Schemas**, right-click and choose **Refresh All**.
2. Expand `civic_db` > **Tables**. You will see all 9 tables:
   - `departments` (5 municipal departments)
   - `users` (7 preloaded accounts)
   - `complaints` (5 realistic civic issues)
   - `ai_analysis` (triage results & tags)
   - `assignments` (work orders & dispatched officers)
   - `complaint_images` (before/after photo evidence)
   - `complaint_status_history` (audit trail)
   - `feedback` (citizen reviews)
   - `notifications` (in-app alerts)

---

## 🔒 Security & Credentials Management (.env)

All sensitive passwords, tokens, and database configuration are stored in `.env` and are strictly excluded from source control:

- ✅ `.env` is declared in `.gitignore` — **your credentials will NEVER be uploaded to GitHub or exposed publicly**.
- ✅ `.env.example` provides a sanitized template for team members and evaluators.

### Your Local `.env` Configuration
Located at: `d:\ai_smart\AI-SMART-CIVIC-COMPLAINT-MANAGMENT-SYSTEM\.env`
```env
# High-Performance MySQL 8+ Database Configuration
DB_URL=jdbc:mysql://localhost:3306/civic_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&rewriteBatchedStatements=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048&useServerPrepStmts=true
DB_USERNAME=root
DB_PASSWORD=Roor@123

# JWT Security Configuration
JWT_SECRET=civic-smart-ai-complaint-system-jwt-secret-key-2026-secure-token
JWT_EXPIRATION_MS=86400000

# Google Gemini API Key (Optional: Leave empty for built-in local AI)
GEMINI_API_KEY=

# Server Configuration
SERVER_PORT=8080

# File Upload Directory
FILE_UPLOAD_DIR=./uploads
```

---

## 🚀 Quick Start & One-Click Launch

### Option A: One-Click Startup (Recommended)
Double-click `start_all.bat` in the project root. This opens both:
- **Backend API**: `http://localhost:8080`
- **Frontend Portal**: `http://localhost:5173`

### Option B: Manual Terminal Startup

**1. Start Backend (Spring Boot)**
```powershell
cd d:\ai_smart\AI-SMART-CIVIC-COMPLAINT-MANAGMENT-SYSTEM\backend
.\mvnw.cmd spring-boot:run
```

**2. Start Frontend (React + Vite)**
```powershell
cd d:\ai_smart\AI-SMART-CIVIC-COMPLAINT-MANAGMENT-SYSTEM\frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 👥 Pre-Configured Demo Accounts

All passwords are encrypted using BCrypt. Use these credentials to test different system roles:

| Role | Name | Email | Password | Assigned Department |
|---|---|---|---|---|
| **ADMIN** | Civic Administrator | `admin@civic.gov` | `admin123` | City Municipal HQ (Superuser) |
| **EMPLOYEE** | Ramesh Sharma | `road.officer@civic.gov` | `officer123` | Road & Infrastructure |
| **EMPLOYEE** | Priya Patil | `water.officer@civic.gov` | `officer123` | Water Supply & Sewerage |
| **EMPLOYEE** | Suresh Deshmukh | `electric.officer@civic.gov` | `officer123` | Electricity & Street Lighting |
| **EMPLOYEE** | Sunita More | `waste.officer@civic.gov` | `officer123` | Solid Waste Management |
| **CITIZEN** | Ganesh Borade | `ganesh@citizen.org` | `citizen123` | Registered Citizen |
| **CITIZEN** | Aarav Mehta | `citizen@civic.org` | `citizen123` | Registered Citizen |

---

## 📡 REST API Documentation

### 1. Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate user and receive JWT bearer token.
- `POST /api/auth/register`: Register a new citizen account.

### 2. Complaints (`/api/complaints`)
- `POST /api/complaints`: Submit a new complaint with image evidence (Multipart).
- `GET /api/complaints`: Retrieve all complaints (filtered by role).
- `GET /api/complaints/{id}`: Detailed complaint view with AI analysis, status history, and photos.
- `PUT /api/complaints/{id}/status`: Update complaint status (`UNDER_REVIEW`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`).
- `POST /api/complaints/{id}/assign`: Assign complaint to a department and officer.
- `POST /api/complaints/{id}/feedback`: Submit citizen star rating (1–5) and review.

### 3. Notifications (`/api/notifications`)
- `GET /api/notifications`: Retrieve current user's in-app notification alerts.
- `GET /api/notifications/unread-count`: Unread notification count badge.
- `PUT /api/notifications/{id}/read`: Mark notification as read.

### 4. Departments & Analytics (`/api/departments`)
- `GET /api/departments`: List all municipal departments with contact details.
- `GET /api/departments/stats`: Real-time KPI statistics per department.

---

## 📊 Presentation & Demonstration Queries

Run these pre-crafted queries in MySQL Workbench or demonstrate them to your professors and competition judges:

```sql
USE civic_db;

-- 1. System User Directory & Role-Based Access Control (RBAC)
SELECT u.id, u.name, u.email, u.role, COALESCE(d.name, 'Citizen') AS department
FROM users u LEFT JOIN departments d ON u.department_id = d.id;

-- 2. AI Triage Engine Accuracy & Confidence Scores
SELECT c.id, c.title, c.category AS reported_cat, ai.category AS ai_cat,
       c.priority, CONCAT(ROUND(ai.confidence * 100, 1), '%') AS ai_confidence, c.status
FROM complaints c JOIN ai_analysis ai ON c.id = ai.complaint_id;

-- 3. Department Dispatch & Field Officer Work Orders
SELECT c.id, c.title, d.name AS department, u.name AS officer, a.assigned_at, c.status
FROM complaints c 
JOIN assignments a ON c.id = a.complaint_id
JOIN departments d ON a.department_id = d.id
JOIN users u ON a.employee_id = u.id;

-- 4. Closed-Loop Governance: Before/After Proof & Citizen Review
SELECT c.id, c.title, c.status, fb.rating, fb.comments, COUNT(img.id) AS photos
FROM complaints c 
LEFT JOIN feedback fb ON c.id = fb.complaint_id
LEFT JOIN complaint_images img ON c.id = img.complaint_id
WHERE c.status = 'RESOLVED'
GROUP BY c.id, c.title, c.status, fb.rating, fb.comments;

-- 5. Municipal Analytics KPI Summary
SELECT d.name, COUNT(c.id) AS total, 
       COUNT(CASE WHEN c.status = 'RESOLVED' THEN 1 END) AS resolved,
       COUNT(CASE WHEN c.priority = 'CRITICAL' THEN 1 END) AS critical
FROM departments d
LEFT JOIN assignments a ON d.id = a.department_id
LEFT JOIN complaints c ON a.complaint_id = c.id
GROUP BY d.name;
```

---

## 🏆 Project Presentation Materials
- **Interactive Presentation Deck (Browser-based PPT)**: Open `presentation.html` in any web browser to view the interactive competition-winning presentation.
- **Slide Script & Q&A Guide**: Open `PRESENTATION_SLIDES.md` for the complete speaking script, slide timings, and judge Q&A preparation.

---

## 🔐 Cryptographic Registration Passkeys
To prevent unauthorized users from registering administrative and municipal field officer accounts:
| Role | Registration Key | Purpose |
|---|---|---|
| **System Administrator** | `ADMIN@2026` | Full city command center, triage queue, AI override, workforce directory |
| **Municipal Field Officer** | `STAFF@2026` | Department work order queue, status transitions, resolution photo upload |
| **Citizen** | *None required* | Free public grievance submission with live GPS and photo proof |

---

## 🌐 Trilingual Accessibility & Dual Themes
- **3 Languages Supported**:
  - 🇬🇧 English (`en`)
  - 🇮🇳 हिंदी - Hindi (`hi`)
  - 🚩 मराठी - Marathi (`mr`)
- **Theme Switcher**:
  - 🌙 **Dark Mode**: High-contrast glassmorphism for night field work and modern command centers.
  - ☀️ **Light Mode**: Clean daylight municipal desk theme.

---

## 📝 Citizen Feedback Survey
Help our engineering team improve civic services:
- **Google Forms Survey Link**: [Open Official Citizen Feedback Survey](https://docs.google.com/forms/d/e/1FAIpQLSddEUsGIPqOsh6uXN01mszEO12jZRgRjV_f6b4b1P07AVM16w/viewform?usp=header)

---

## 👥 Project Credits & Team Information
- **Developed with ❤️ by**: **TeamGanesh**
- **Lead Developer**: Ganesh Borade
- **Official Contact Email**: [`ganuborade9898@gmail.com`](mailto:ganuborade9898@gmail.com)
- **Mobile / WhatsApp Helpline**: `+91 9096040485` / `9096040485`
- **Municipal Jurisdiction**: Pune Municipal Corporation (PMC), Maharashtra, India

