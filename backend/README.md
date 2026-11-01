# HRNexus — Backend API

A RESTful backend for a Workforce & HR Management Portal, built for automating employee attendance, leave management, and monthly payroll processing.

**Developed by Majid Awan**

---

## Features

- **Multi-tenancy** — every record belongs to a company (`companyId`); the company always comes from the JWT, never from the request body, so companies cannot see each other's data
- **Plans** — Free (10 employees) and Pro (unlimited); upgrade is a demo (no real payment)
- **Superadmin** — platform owner who can list all companies
- **Authentication** — JWT-based (carries `companyId` and role); role-based access control (Superadmin / Admin / HR / Manager / Employee)
- **Employee Management** — Full CRUD for employee profiles, salary structure, and bank details
- **Attendance Tracking** — Manual entry + biometric device webhook integration (device-agnostic)
- **Leave Management** — Apply, approve, and reject leave requests with automatic balance tracking
- **Shift Management** — Define custom shifts with grace periods and break times
- **Payroll Engine** — Automated salary calculation based on attendance, approved leaves, overtime, late arrivals, and custom allowances/deductions
- **Payslip Generation** — Auto-generated PDF payslips per employee per month
- **Excel Reports** — Attendance and payroll data exportable as formatted `.xlsx` files
- **Biometric Webhook** — Accepts punch data from any ADMS-compatible device (ZKTeco, Hikvision, etc.)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas) via Mongoose |
| Auth | JWT + bcrypt |
| PDF Generation | PDFKit |
| Excel Generation | ExcelJS |

---

## Project Structure

backend/
├── models/ # Mongoose schemas (Company, User, Employee, Attendance, Leave, Shift, Payroll)
├── routes/ # Express route handlers per module
├── middleware/ # JWT auth, role-based authorization, tenant (companyId) loader
├── scripts/ # migrate.js (old single-company data) and seed.js (superadmin)
├── utils/ # tenant helpers, sample data
├── payslips/ # Generated PDF payslips (runtime output)
├── server.js # App entry point
└── .env # Environment variables (not committed)


---

## Setup

1. Install dependencies:
```bash
   npm install
```

2. Create a `.env` file in the root with:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

# Only needed for `npm run seed` (platform owner account)
SUPERADMIN_EMAIL=owner@example.com
SUPERADMIN_PASSWORD=choose_a_password_of_8_or_more_chars
SUPERADMIN_NAME=Platform Owner


3. Run in development mode:
```bash
   npm run dev
```

Server runs at `http://localhost:5000`.

4. Create the superadmin (safe to re-run; it skips if one exists):
```bash
   npm run seed
```
The seed creates **only** the superadmin. There is no default admin account; companies sign up through `POST /api/auth/register-company` (the frontend's "Start free").

5. **Upgrading an old single-company database only:** run `npm run migrate` once. It puts the existing data into a "Default Company" (Pro plan), lowercases user emails, drops the old global unique indexes and builds the per-company ones. Back up first. Fresh databases do not need it.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register-company` | Public. Creates a company and its first admin, returns a JWT |
| POST | `/api/auth/register` | Admin only. Adds a user (admin/hr/manager/employee) to the admin's own company |
| POST | `/api/auth/login` | Login and receive JWT token (includes `company`) |

### Company
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/company/me` | Any user of the company (plan, limit, usage; `biometricKey` for admin only) |
| POST | `/api/company/upgrade` | Admin. Demo upgrade to Pro, no real payment |
| POST | `/api/company/sample-data` | Admin. Adds 8 demo employees and attendance, once per company |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/dashboard/stats` | Any user of the company (payroll total for admin/HR only; "today" is Asia/Karachi) |

### Superadmin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/superadmin/companies` | Superadmin only. All companies with plan, employee count and admin |

### Employees
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/employees` | Any authenticated user |
| POST | `/api/employees` | Admin, HR (403 `PLAN_LIMIT` when the Free plan is full) |
| PUT | `/api/employees/:id` | Admin, HR |
| DELETE | `/api/employees/:id` | Admin |

### Attendance
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/attendance` | Any authenticated user |
| POST | `/api/attendance` | Admin, HR |
| PUT | `/api/attendance/:id` | Admin, HR |
| DELETE | `/api/attendance/:id` | Admin |

### Leaves
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/leaves` | Any authenticated user |
| POST | `/api/leaves` | Any authenticated user |
| PUT | `/api/leaves/:id` | Admin, HR (approve/reject) |
| DELETE | `/api/leaves/:id` | Admin |

### Shifts
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/shifts` | Any authenticated user |
| POST / PUT / DELETE | `/api/shifts` | Admin, HR |

### Payroll
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/payroll/generate` | Admin, HR |
| GET | `/api/payroll` | Admin, HR |
| GET | `/api/payroll/employee/:employeeId` | Any authenticated user |

### Payslip
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payslip/:payrollId` | Downloads a generated PDF payslip |

### Biometric
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/biometric/webhook` | Receives punch data (`biometricId`, `timestamp`, `deviceId`) from any ADMS-compatible device. Identifies the company by its biometric key (`x-biometric-key` header or `?key=`, shown in Settings). First punch of the day is check-in, second is check-out. The day is the Asia/Karachi calendar date. |

### Reports
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/export/attendance` | Admin, HR — downloads Excel attendance report |
| GET | `/api/export/payroll` | Admin, HR — downloads Excel payroll report |

### Tenant isolation
Every route above except register-company, login, the biometric webhook and the superadmin route runs behind `protect` and `tenant`, and every query filters by the company from the token. Another company's record id returns 404.

---

## Payroll Calculation Logic

Net salary is calculated per employee per month as:

Gross Salary = Base Salary + Overtime Amount + Allowances
Total Deductions = (Unpaid Leave Days + Absent Days) × Per-Day Rate
+ Late Deduction
+ Custom Deductions
Net Salary = Gross Salary − Total Deductions


Overtime is paid at 1.5× the per-hour rate. Late deductions are calculated from accumulated late-arrival minutes across the month.

---

## Notes on Biometric Integration

This system does not communicate directly with physical hardware. Instead, it exposes a generic webhook that any ADMS-compatible push-server software (bundled with ZKTeco, Hikvision, and similar devices) can call. Deploying with a specific device only requires configuring that device's push-server with this webhook URL — no additional backend code is needed unless the device's payload field names differ, in which case a small mapping adapter can be added to `biometricRoutes.js`.