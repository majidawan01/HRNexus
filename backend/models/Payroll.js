const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: Number,   // 1-12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  baseSalary: {
    type: Number,
    required: true
  },
  totalWorkingDays: {
    type: Number,
    default: 0
  },
  presentDays: {
    type: Number,
    default: 0
  },
  absentDays: {
    type: Number,
    default: 0
  },
  paidLeaveDays: {
    type: Number,
    default: 0
  },
  unpaidLeaveDays: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  overtimeAmount: {
    type: Number,
    default: 0
  },
  lateDeductionAmount: {
    type: Number,
    default: 0
  },
  allowances: [
    {
      title: String,
      amount: Number
    }
  ],
  deductions: [
    {
      title: String,
      amount: Number
    }
  ],
  grossSalary: {
    type: Number,
    default: 0
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'paid'],
    default: 'draft'
  }
}, { timestamps: true });

// Ek employee ki ek month mein sirf ek hi payroll ho sakti hai
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);