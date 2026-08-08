const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/authMiddleware');

// GENERATE PAYROLL - Ek employee ki ek month ki salary calculate karna (sirf admin/hr)
router.post('/generate', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    // 1. Employee ka data nikalna
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 2. Month ke start aur end date banana
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // month ka last din
    const totalWorkingDays = endDate.getDate(); // simple: mahine ke total din

    // 3. Us employee ki us month ki attendance nikalna
    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    // 4. Present/Absent/Late days count karna
    let presentDays = 0;
    let overtimeMinutesTotal = 0;
    let lateMinutesTotal = 0;

    attendanceRecords.forEach((record) => {
      if (record.status === 'present' || record.status === 'late' || record.status === 'half-day') {
        presentDays++;
      }
      overtimeMinutesTotal += record.overtimeMinutes || 0;
      lateMinutesTotal += record.lateMinutes || 0;
    });

    // 5. Us month ki approved leaves nikalna
    const leaves = await Leave.find({
      employeeId: employeeId,
      status: 'approved',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;

    leaves.forEach((leave) => {
      if (leave.isPaid) {
        paidLeaveDays += leave.totalDays;
      } else {
        unpaidLeaveDays += leave.totalDays;
      }
    });

    // 6. Absent days calculate karna
    const absentDays = totalWorkingDays - presentDays - paidLeaveDays - unpaidLeaveDays;

    // 7. Per-day salary rate nikalna
    const perDaySalary = employee.baseSalary / totalWorkingDays;

    // 8. Overtime amount calculate karna (per hour rate = per day rate / 8 hours)
    const perHourRate = perDaySalary / 8;
    const overtimeHours = overtimeMinutesTotal / 60;
    const overtimeAmount = overtimeHours * perHourRate * 1.5; // 1.5x rate for overtime

    // 9. Late deduction calculate karna (simple rule: har 60 min late = 1 hour ki deduction)
    const lateDeductionAmount = (lateMinutesTotal / 60) * perHourRate;

    // 10. Unpaid leave aur absent days ki deduction
    const unpaidDeduction = (unpaidLeaveDays + absentDays) * perDaySalary;

    // 11. Allowances aur Deductions (agar request mein diye gaye hon)
    const allowances = req.body.allowances || [];
    const deductions = req.body.deductions || [];

    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalCustomDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    // 12. Final calculation
    const grossSalary = employee.baseSalary + overtimeAmount + totalAllowances;
    const totalDeductions = unpaidDeduction + lateDeductionAmount + totalCustomDeductions;
    const netSalary = grossSalary - totalDeductions;

    // 13. Payroll record banana ya update karna (agar pehle se ho to overwrite)
    const payrollData = {
      employeeId,
      month,
      year,
      baseSalary: employee.baseSalary,
      totalWorkingDays,
      presentDays,
      absentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      overtimeHours,
      overtimeAmount,
      lateDeductionAmount,
      allowances,
      deductions,
      grossSalary,
      totalDeductions,
      netSalary,
      status: 'draft'
    };

    const payroll = await Payroll.findOneAndUpdate(
      { employeeId, month, year },
      payrollData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Sab payroll records dekhna
router.get('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('employeeId', 'fullName employeeCode');
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Ek employee ki payroll history dekhna
router.get('/employee/:employeeId', protect, async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employeeId: req.params.employeeId });
    res.status(200).json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Payroll status finalize/paid karna (sirf admin/hr)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    res.status(200).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;