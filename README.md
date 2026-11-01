# HRNexus

A multi-tenant HR SaaS built with the MERN stack. Each company signs up on its own and gets a private workspace for employees, attendance, leave and payroll, on a Free (up to 10 employees) or Pro (unlimited) plan. A superadmin view lets the platform owner see every company.

**Developed by Majid Awan**

- [Frontend README](frontend/README.md): React 19, Vite, Tailwind v4
- [Backend README](backend/README.md): Express 5, MongoDB, API reference and setup

## Screenshots

| Landing | Pricing |
|---|---|
| ![Landing page](docs/screenshots/01-landing.png) | ![Pricing](docs/screenshots/02-pricing.png) |

| Company signup | Dashboard with plan usage |
|---|---|
| ![Signup](docs/screenshots/03-signup.png) | ![Dashboard](docs/screenshots/04-dashboard.png) |

| Employees | Leaves |
|---|---|
| ![Employees](docs/screenshots/05-employees.png) | ![Leaves](docs/screenshots/06-leaves.png) |

| Payroll and payslips | Upgrade modal (demo, no real payment) |
|---|---|
| ![Payroll](docs/screenshots/07-payroll.png) | ![Upgrade modal](docs/screenshots/08-upgrade.png) |

| Settings | Superadmin dashboard |
|---|---|
| ![Settings](docs/screenshots/09-settings.png) | ![Superadmin](docs/screenshots/10-superadmin.png) |

**Mobile**

<p>
  <img src="docs/screenshots/11-mobile-dashboard.png" alt="Mobile dashboard" width="260">
  &nbsp;
  <img src="docs/screenshots/12-mobile-employees.png" alt="Mobile employees" width="260">
</p>

The screenshots use made-up demo data (sample companies and employees). Emails in the superadmin view are masked.

## Quick start

```bash
# backend
cd backend && npm install
# create .env (MONGO_URI, JWT_SECRET, SUPERADMIN_*), then:
npm run seed     # creates the superadmin only
npm run dev      # http://localhost:5000

# frontend
cd frontend && npm install
npm run dev      # http://localhost:5173
```

There is no default login. Open the app, click **Start free** and create a company. Details are in the two READMEs above.
