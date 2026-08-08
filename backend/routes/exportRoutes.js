const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const { protect, authorize } = require('../middleware/authMiddleware');

// EXPORT - Attendance Excel report
router.get('/attendance', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const records = await Attendance.find().populate('employeeId', 'fullName employeeCode department');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    // Columns define karna
    sheet.columns = [
      { header: 'Employee Code', key: 'code', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Department', key: 'department', width: 18 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Check In', key: 'checkIn', width: 20 },
      { header: 'Check Out', key: 'checkOut', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Late (min)', key: 'lateMinutes', width: 12 },
      { header: 'Overtime (min)', key: 'overtimeMinutes', width: 14 },
      { header: 'Source', key: 'source', width: 12 },
    ];

    // Header row ko style dena (bold, colored)
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF14161A' },
    };

    // Data rows add karna
    records.forEach((rec) => {
      sheet.addRow({
        code: rec.employeeId?.employeeCode || '-',
        name: rec.employeeId?.fullName || 'Unknown',
        department: rec.employeeId?.department || '-',
        date: new Date(rec.date).toLocaleDateString(),
        checkIn: rec.checkIn ? new Date(rec.checkIn).toLocaleString() : '-',
        checkOut: rec.checkOut ? new Date(rec.checkOut).toLocaleString() : '-',
        status: rec.status,
        lateMinutes: rec.lateMinutes || 0,
        overtimeMinutes: rec.overtimeMinutes || 0,
        source: rec.source,
      });
    });

    // File ko response mein bhejna (direct download)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// EXPORT - Payroll Excel report
router.get('/payroll', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const records = await Payroll.find().populate('employeeId', 'fullName employeeCode department');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payroll Report');

    sheet.columns = [
      { header: 'Employee Code', key: 'code', width: 15 },
      { header: 'Employee Name', key: 'name', width: 25 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Present Days', key: 'presentDays', width: 12 },
      { header: 'Absent Days', key: 'absentDays', width: 12 },
      { header: 'Paid Leaves', key: 'paidLeaveDays', width: 12 },
      { header: 'Overtime Amount', key: 'overtimeAmount', width: 16 },
      { header: 'Gross Salary', key: 'grossSalary', width: 15 },
      { header: 'Total Deductions', key: 'totalDeductions', width: 16 },
      { header: 'Net Salary', key: 'netSalary', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF14161A' },
    };

    records.forEach((rec) => {
      sheet.addRow({
        code: rec.employeeId?.employeeCode || '-',
        name: rec.employeeId?.fullName || 'Unknown',
        month: rec.month,
        year: rec.year,
        presentDays: rec.presentDays,
        absentDays: rec.absentDays,
        paidLeaveDays: rec.paidLeaveDays,
        overtimeAmount: rec.overtimeAmount?.toFixed(2),
        grossSalary: rec.grossSalary?.toFixed(2),
        totalDeductions: rec.totalDeductions?.toFixed(2),
        netSalary: rec.netSalary?.toFixed(2),
        status: rec.status,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=payroll_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;