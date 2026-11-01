const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: String,   // e.g. "09:00"
    required: true
  },
  endTime: {
    type: String,   // e.g. "18:00"
    required: true
  },
  gracePeriodMinutes: {
    type: Number,
    default: 10
  },
  breakMinutes: {
    type: Number,
    default: 60
  }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);