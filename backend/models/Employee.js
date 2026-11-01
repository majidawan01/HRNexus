const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  employeeCode: {
    type: String,
    required: true
  },
  biometricId: {
    type: String
  },
  fullName: {
    type: String,
    required: true
  },
  cnic: {
    type: String,
    required: true
  },
  contactNumber: String,
  email: {
    type: String,
    required: true
  },
  address: String,
  department: String,
  designation: String,
  joiningDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'resigned', 'terminated'],
    default: 'active'
  },
  bankDetails: {
    bankName: String,
    accountTitle: String,
    accountNumber: String
  },
  baseSalary: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Uniqueness ab company ke andar hai (global nahi)
employeeSchema.index({ companyId: 1, employeeCode: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, email: 1 }, { unique: true });
// biometricId sirf tab unique jab woh string ho (khaali/missing ignore)
employeeSchema.index(
  { companyId: 1, biometricId: 1 },
  { unique: true, partialFilterExpression: { biometricId: { $type: 'string' } } }
);

module.exports = mongoose.model('Employee', employeeSchema);