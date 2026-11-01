const mongoose = require('mongoose');
const crypto = require('crypto');

const FREE_EMPLOYEE_LIMIT = 10;

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  // free = 10, pro = null (unlimited)
  employeeLimit: {
    type: Number,
    default: FREE_EMPLOYEE_LIMIT
  },
  // Biometric device webhook ke liye company-wise secret key
  biometricKey: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(24).toString('hex')
  }
}, { timestamps: true });

companySchema.statics.FREE_EMPLOYEE_LIMIT = FREE_EMPLOYEE_LIMIT;

module.exports = mongoose.model('Company', companySchema);
