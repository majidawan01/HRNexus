# HRNexus — Frontend

A multi-tenant HR SaaS dashboard: every company signs up on its own, gets an isolated workspace, and manages employees, attendance, leave requests and monthly payroll. Free and Pro plans, plus a platform-owner (superadmin) view.

**Developed by Majid Awan**

---

## Features

- **Landing page** — hero, features, Free/Pro pricing, FAQ; "Start free" goes to signup
- **Company signup + onboarding** — create a company and its first admin, then a 2-step guide (first employee, invite an HR teammate; both skippable)
- **Multi-tenant workspace** — sidebar shows the company name and plan badge; each company only ever sees its own data
- **Plans** — Free (up to 10 employees) and Pro (unlimited). Dashboard usage bar suggests upgrading near the limit; hitting the limit opens the Upgrade modal
- **Upgrade modal (demo)** — plan comparison and a demo payment form. **Demo mode: no real payment, and no card data is saved or sent to the server**
- **Role-aware UI** — Admin / HR / Manager / Employee see only what they can use
- **Employee directory** — search, add, and delete (admin, with confirm)
- **Attendance** — manual marking plus biometric-sourced records; Excel export
- **Leaves** — apply; Admin/HR approve or reject (with confirm)
- **Payroll & payslips** — generate per employee/month; PDF payslips and Excel exports download through authenticated requests
- **Dashboard** — stats cards and a department-wise chart
- **Settings (admin)** — plan and usage, biometric webhook URL and key, "Load sample data" (one-time demo employees and attendance)
- **Superadmin dashboard** — total companies, plan breakdown, signups graph, searchable companies table
- **Polish** — loading skeletons, toasts, empty states, confirm dialogs, mobile-responsive layout

---

## Design System

| Token | Use |
|---|---|
| `ink` | Primary text |
| `bg` (cream) | Page background |
| `surface` | Cards |
| `accent` (indigo) | Primary actions |
| `teal` | Positive / approved |
| `rust` | Alert / rejected / absent |
| `ash` | Muted text and labels |

Tokens live in `src/index.css` (`@theme`). **Typography:** Space Grotesk (display), Inter (body), JetBrains Mono (data/timestamps).

---

## Tech Stack

React 19 (Vite), Tailwind CSS v4, Framer Motion, React Router DOM 7, Recharts, Lucide React, Axios.

---

## Project Structure

```
src/
├── api/axios.js          # Axios instance (base URL, token header, 401 handling)
├── context/              # Auth, toast, confirm-dialog and upgrade-modal providers
├── hooks/useResource.js  # Loading / error / retry for page data
├── lib/                  # session, plans, errors, blob downloads, superadmin stats
├── components/
│   ├── ui/               # Button, Field, Modal, DataTable, Skeleton, EmptyState, ...
│   ├── landing/          # Landing page sections
│   ├── billing/          # Plan comparison, demo payment, Upgrade modal
│   ├── superadmin/       # Stat cards, charts, companies table
│   ├── Layout.jsx        # Sidebar + mobile drawer shell
│   └── ProtectedRoute.jsx
├── pages/                # Landing, Signup, Login, Onboarding, Dashboard, Employees,
│                         # Attendance, Leaves, Payroll, Settings, SuperadminDashboard
├── App.jsx               # Routes
└── main.jsx              # Providers + BrowserRouter
```

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the backend (see the backend README). The dev server talks to `http://localhost:5000/api` via `.env.development`.

3. Run the dev server:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`.

For production set `VITE_API_URL` to your deployed backend, e.g. `https://your-backend.vercel.app/api`. `vercel.json` rewrites all routes to `index.html` so deep links work.

---

## Getting started (no demo login)

There is no default account. Instead:

1. Open the app and click **Start free** to create a company. You become that company's admin.
2. Finish the onboarding, or use **Settings → Load sample data** to fill the workspace with demo employees.
3. **Superadmin:** create the platform owner by running `npm run seed` in the backend (credentials come from the backend `.env`, see the backend README), then log in on the normal login page. You will land on the Companies dashboard.

---

## Notes

- The token and user info are stored in `localStorage` after login. A shared Axios interceptor adds the `Authorization: Bearer <token>` header to every request and signs you out on an expired token.
- Excel exports and payslips are fetched as blobs with that header, then saved through the browser, so they work with authentication.
- The payment form is a demo. Nothing is charged and nothing about a card leaves the browser.
