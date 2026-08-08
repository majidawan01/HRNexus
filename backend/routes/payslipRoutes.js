const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// GENERATE PAYSLIP PDF - Payroll ID se PDF banana
router.get('/:payrollId', async (req, res) => {
  try {
    // 1. Payroll aur Employee ka data nikalna
    const payroll = await Payroll.findById(req.params.payrollId);
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const employee = await Employee.findById(payroll.employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // 2. PDF file ka naam aur path banana
    const fileName = `payslip_${employee.employeeCode}_${payroll.month}_${payroll.year}.pdf`;
    const filePath = path.join(__dirname, '../payslips', fileName);

    // 3. Naya PDF document banana
  const doc = new PDFDocument({ margin: 50 });
const writeStream = fs.createWriteStream(filePath);
doc.pipe(writeStream);
    // 4. Header
    doc.fontSize(20).text('HRNexus - Salary Payslip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Month: ${payroll.month}/${payroll.year}`, { align: 'center' });
    doc.moveDown(2);

    // 5. Employee Details
    doc.fontSize(12).text(`Employee Name: ${employee.fullName}`);
    doc.text(`Employee Code: ${employee.employeeCode}`);
    doc.text(`Designation: ${employee.designation}`);
    doc.text(`Department: ${employee.department}`);
    doc.moveDown();

    // 6. Attendance Summary
    doc.fontSize(14).text('Attendance Summary', { underline: true });
    doc.fontSize(11);
    doc.text(`Total Working Days: ${payroll.totalWorkingDays}`);
    doc.text(`Present Days: ${payroll.presentDays}`);
    doc.text(`Absent Days: ${payroll.absentDays}`);
    doc.text(`Paid Leave Days: ${payroll.paidLeaveDays}`);
    doc.text(`Unpaid Leave Days: ${payroll.unpaidLeaveDays}`);
    doc.moveDown();

    // 7. Earnings
    doc.fontSize(14).text('Earnings', { underline: true });
    doc.fontSize(11);
    doc.text(`Base Salary: Rs. ${payroll.baseSalary.toFixed(2)}`);
    doc.text(`Overtime Amount: Rs. ${payroll.overtimeAmount.toFixed(2)}`);
    payroll.allowances.forEach((a) => {
      doc.text(`${a.title}: Rs. ${a.amount.toFixed(2)}`);
    });
    doc.moveDown();

    // 8. Deductions
    doc.fontSize(14).text('Deductions', { underline: true });
    doc.fontSize(11);
    doc.text(`Late Deduction: Rs. ${payroll.lateDeductionAmount.toFixed(2)}`);
    payroll.deductions.forEach((d) => {
      doc.text(`${d.title}: Rs. ${d.amount.toFixed(2)}`);
    });
    doc.moveDown();

    // 9. Totals
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Gross Salary: Rs. ${payroll.grossSalary.toFixed(2)}`);
    doc.text(`Total Deductions: Rs. ${payroll.totalDeductions.toFixed(2)}`);
    doc.fontSize(14).text(`Net Salary: Rs. ${payroll.netSalary.toFixed(2)}`, { bold: true });

  doc.end();

// 10. PDF ban jane ke baad (file poori tarah disk par likh jane ke baad), use response mein bhej dena
writeStream.on('finish', () => {
  res.download(filePath);
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;