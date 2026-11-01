const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { protect } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');

// "Aaj" ki hadd Asia/Karachi (UTC+5, DST nahi) ke hisab se: [PKT aadhi raat, agli PKT aadhi raat)
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const pktTodayRange = () => {
  const pktNow = Date.now() + PKT_OFFSET_MS;
  const start = Math.floor(pktNow / DAY_MS) * DAY_MS - PKT_OFFSET_MS;
  return { start: new Date(start), end: new Date(start + DAY_MS) };
};

// DASHBOARD STATS - Apni company ke numbers (ek hi request mein)
router.get('/stats', protect, tenant, async (req, res) => {
  try {
    const companyId = req.companyId;
    const canSeePayroll = ['admin', 'hr'].includes(req.user.role);

    const { start: startOfDay, end: endOfDay } = pktTodayRange();

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
