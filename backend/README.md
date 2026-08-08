# HRNexus — Backend API

A RESTful backend for a Workforce & HR Management Portal, built for automating employee attendance, leave management, and monthly payroll processing.

**Developed by Majid Awan**

---

## Features

- **Authentication** — JWT-based login/register with role-based access control (Admin / HR / Employee)
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
├── models/ # Mongoose schemas (Employee, Attendance, Leave, Shift, Payroll, User)
├── routes/ # Express route handlers per module
├── middleware/ # JWT auth + role-based authorization
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


3. Run in development mode:
```bash
   npm run dev
```

Server runs at `http://localhost:5000`.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Employees
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/employees` | Any authenticated user |
| POST | `/api/employees` | Admin, HR |
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
| POST | `/api/biometric/webhook` | Receives punch data (`biometricId`, `timestamp`, `deviceId`) from any ADMS-compatible device. First punch of the day is treated as check-in, second as check-out. |

### Reports
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/export/attendance` | Admin, HR — downloads Excel attendance report |
| GET | `/api/export/payroll` | Admin, HR — downloads Excel payroll report |

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