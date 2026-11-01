const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /companies - Sab companies ki list (sirf superadmin). Yeh route jaan boojh kar tenant middleware
// se nahi guzarta, kyunke superadmin kisi company ka nahi hota. Sirf summary deta hai, employee data nahi.
router.get('/companies', protect, authorize('superadmin'), async (req, res) => {
  try {
    const [companies, counts, admins] = await Promise.all([
      Company.find().sort({ createdAt: -1 }).lean(),
      Employee.aggregate([{ $group: { _id: '$companyId', count: { $sum: 1 } } }]),
      User.find({ role: 'admin' }, 'companyId email name createdAt').sort({ createdAt: 1 }).lean()
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    const adminMap = new Map();
    admins.forEach((a) => {
      const key = String(a.companyId);
      if (!adminMap.has(key)) adminMap.set(key, a); // sabse purana admin = pehla admin
    });

    const result = companies.map((c) => {
      const admin = adminMap.get(String(c._id));
      return {
        _id: c._id,
        name: c.name,
        plan: c.plan,
        employeeLimit: c.employeeLimit,
        employeeCount: countMap.get(String(c._id)) || 0,
        adminName: admin?.name || null,
        adminEmail: admin?.email || null,
        createdAt: c.createdAt
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
