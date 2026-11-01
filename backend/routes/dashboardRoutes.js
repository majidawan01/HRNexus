const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { protect } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');

// DASHBOARD STATS - Apni company ke numbers (ek hi request mein)
router.get('/stats', protect, tenant, async (req, res) => {
  try {
    const companyId = req.companyId;
    const canSeePayroll = ['admin', 'hr'].includes(req.user.role);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [totalEmployees, presentToday, pendingLeaves, deptGroups, payrollAgg] = await Promise.all([
      Employee.countDocuments({ companyId }),
      Attendance.countDocuments({
        companyId,
        date: { $gte: startOfDay, $lt: endOfDay },
        status: { $ne: 'absent' }
      }),
      Leave.countDocuments({ companyId, status: 'pending' }),
      Employee.aggregate([
        { $match: { companyId } },
        { $group: { _id: '$department', count: { $sum: 1 } } }
      ]),
      canSeePayroll
        ? Payroll.aggregate([
            { $match: { companyId } },
            { $group: { _id: null, total: { $sum: '$netSalary' } } }
          ])
        : Promise.resolve([])
    ]);

    // Khaali department "Other" mein jama
    const deptMap = {};
    deptGroups.forEach((g) => {
      const name = g._id || 'Other';
      deptMap[name] = (deptMap[name] || 0) + g.count;
    });
    const departmentCounts = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    res.status(200).json({
      totalEmployees,
      presentToday,
      pendingLeaves,
      totalPayroll: canSeePayroll ? (payrollAgg[0]?.total || 0) : null,
      departmentCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
