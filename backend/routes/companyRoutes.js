const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const {
  SAMPLE_COUNT,
  sampleCodes,
  sampleEmails,
  buildSampleEmployees,
  buildSampleAttendance
} = require('../utils/sampleData');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');

// GET /me - Apni company ki info (navbar, plan, limit). biometricKey sirf admin ko dikhti hai.
router.get('/me', protect, tenant, async (req, res) => {
  try {
    const company = req.company;
    const employeeCount = await Employee.countDocuments({ companyId: req.companyId });

    const data = {
      _id: company._id,
      name: company.name,
      plan: company.plan,
      employeeLimit: company.employeeLimit, // null = unlimited
      employeeCount,
      sampleDataLoaded: !!company.sampleDataLoaded
    };
    if (req.user.role === 'admin') {
      data.biometricKey = company.biometricKey;
    }
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /upgrade - Fake payment: bas plan "pro" kar deta hai (sirf admin)
router.post('/upgrade', protect, tenant, authorize('admin'), async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.companyId,
      { plan: 'pro', employeeLimit: null },
      { new: true }
    );
    res.status(200).json({
      message: 'Upgraded to Pro',
      company: { _id: company._id, name: company.name, plan: company.plan, employeeLimit: company.employeeLimit }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /sample-data - Demo employees + attendance sirf apni company mein (sirf admin, sirf ek baar)
router.post('/sample-data', protect, tenant, authorize('admin'), async (req, res) => {
  const companyId = req.companyId;
  try {
    if (req.company.sampleDataLoaded) {
      return res.status(409).json({ code: 'SAMPLE_ALREADY_LOADED', message: 'Sample data has already been loaded for this company.' });
    }

    // Free plan ki limit ka khayal
    const limit = req.company.employeeLimit;
    if (req.company.plan !== 'pro' && limit != null) {
      const count = await Employee.countDocuments({ companyId });
      if (count + SAMPLE_COUNT > limit) {
        return res.status(403).json({
          code: 'PLAN_LIMIT',
          message: `Sample data adds ${SAMPLE_COUNT} employees, but your Free plan has room for only ${Math.max(limit - count, 0)} more. Upgrade to Pro or remove employees first.`
        });
      }
    }

    // Kisi purane employee ka code/email takra na jaye
    const clash = await Employee.exists({
      companyId,
      $or: [{ employeeCode: { $in: sampleCodes() } }, { email: { $in: sampleEmails() } }]
    });
    if (clash) {
      return res.status(409).json({ code: 'SAMPLE_CODE_TAKEN', message: 'Some employee codes (DEMO-001...) or emails already exist in your company.' });
    }

    // Atomic claim: do clicks ek saath hon to sirf ek kamyab hoga
    const claimed = await Company.findOneAndUpdate(
      { _id: companyId, sampleDataLoaded: { $ne: true } },
      { $set: { sampleDataLoaded: true } }
    );
    if (!claimed) {
      return res.status(409).json({ code: 'SAMPLE_ALREADY_LOADED', message: 'Sample data has already been loaded for this company.' });
    }

    try {
      const employees = await Employee.insertMany(buildSampleEmployees(companyId));
      const attendance = await Attendance.insertMany(buildSampleAttendance(companyId, employees));
      res.status(201).json({ employeesAdded: employees.length, attendanceAdded: attendance.length });
    } catch (err) {
      // Adhoora data wapas, aur dobara koshish ki ijazat
      await Attendance.deleteMany({ companyId, remarks: 'Sample data' });
      await Employee.deleteMany({ companyId, employeeCode: { $in: sampleCodes() } });
      await Company.updateOne({ _id: companyId }, { $set: { sampleDataLoaded: false } });
      throw err;
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
