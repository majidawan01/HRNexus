const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: {
    type: String,
    required: true,
    unique: true
  },
  biometricId: {
  type: String,
  unique: true,
  sparse: true   // matlab: agar khaali ho to bhi masla nahi (sab employees ke paas biometric ID na ho)
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
    required: true,
    unique: true
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

module.exports = mongoose.model('Employee', employeeSchema);