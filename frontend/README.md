# HRNexus — Frontend

A workforce & HR management dashboard built for tracking employee profiles, attendance, leave requests, and monthly payroll — with a distinctive, non-templated visual identity.

**Developed by Majid Awan**

---

## Features

- **Secure Login** — JWT-based authentication with protected routing
- **Role-Aware Sidebar** — Navigation and actions adapt to Admin / HR / Employee roles
- **Employee Directory** — Searchable table with add-employee modal
- **Attendance Log** — Manual attendance marking + biometric-sourced records shown side by side
- **Leave Management** — Apply for leave; Admin/HR can approve or reject with one click
- **Payroll & Payslips** — Generate monthly payroll per employee, download PDF payslips instantly
- **Reports** — One-click Excel export for attendance and payroll data
- **Dashboard** — Live stats cards and a department-wise employee chart

---

## Design System

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#14161A` | Primary background |
| `--color-paper` | `#F7F5F1` | Card / surface background |
| `--color-amber` | `#E8A33D` | Signature accent (primary actions) |
| `--color-teal` | `#3D8B7A` | Positive / approved states |
| `--color-rust` | `#C1502E` | Alert / rejected / absent states |
| `--color-ash` | `#8A8D93` | Muted text and labels |

**Typography:** Space Grotesk (display), Inter (body), JetBrains Mono (data/timestamps) — chosen to reflect the product's "systems and time" identity rather than a generic dashboard look.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Routing | React Router DOM |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |

---

## Project Structure

frontend/
├── src/
│ ├── api/
│ │ └── axios.js # Configured Axios instance
│ ├── components/
│ │ ├── Layout.jsx # Sidebar + shell used by all authenticated pages
│ │ ├── ProtectedRoute.jsx
│ │ └── EmployeeModal.jsx
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Employees.jsx
│ │ ├── Attendance.jsx
│ │ ├── Leaves.jsx
│ │ └── Payroll.jsx
│ ├── App.jsx # Route definitions
│ ├── main.jsx # App entry + BrowserRouter
│ └── index.css # Tailwind import + design tokens
└── index.html


---

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Ensure the backend is running at `http://localhost:5000` (see backend README).

3. Run the dev server:
```bash
   npm run dev
```

App runs at `http://localhost:5173`.

---

## Default Login (for demo/testing)

Email: admin@hrnexus.com
Password: admin123


> Change or remove this account before deploying to production.

---

## Notes

- Auth token and user info are stored in `localStorage` after login and attached to all API requests via the `Authorization: Bearer <token>` header.
- Excel exports and payslip downloads are streamed directly from the backend as binary responses and triggered via the browser's native download mechanism.