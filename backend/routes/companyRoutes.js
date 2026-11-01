const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Employee = require('../models/Employee');
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
      employeeCount
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

module.exports = router;
