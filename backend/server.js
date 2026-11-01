const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection: ek hi promise cache hota hai (Vercel serverless mein har request
// purane connection ko dobara use kare), aur request tab chalti hai jab DB connect ho chuka ho.
let dbPromise = null;
function connectDB() {
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
      .then((m) => {
        console.log('✅ MongoDB connected');
        return m;
      })
      .catch((err) => {
        dbPromise = null; // agli request dobara koshish kare
        throw err;
      });
  }
  return dbPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.log('❌ MongoDB connection error:', err.message);
    res.status(503).json({ message: 'Database is unavailable. Please try again in a moment.' });
  }
});

// Routes
const employeeRoutes = require('./routes/employeeRoutes');
app.use('/api/employees', employeeRoutes);
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);
const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leaves', leaveRoutes);
const shiftRoutes = require('./routes/shiftRoutes');
app.use('/api/shifts', shiftRoutes);
const payrollRoutes = require('./routes/payrollRoutes');
app.use('/api/payroll', payrollRoutes);
const payslipRoutes = require('./routes/payslipRoutes');
app.use('/api/payslip', payslipRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const biometricRoutes = require('./routes/biometricRoutes');
app.use('/api/biometric', biometricRoutes);
const exportRoutes = require('./routes/exportRoutes');
app.use('/api/export', exportRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const companyRoutes = require('./routes/companyRoutes');
app.use('/api/company', companyRoutes);
const superadminRoutes = require('./routes/superadminRoutes');
app.use('/api/superadmin', superadminRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('HRNexus Backend is running ✅');
});

// Server start
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;