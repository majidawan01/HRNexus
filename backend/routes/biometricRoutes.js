const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// WEBHOOK - Biometric device se attendance receive karna
router.post('/webhook', async (req, res) => {
  try {
    // Device se aane wala data (ye format device/middleware ke mutabiq adjust hoga)
    const { biometricId, timestamp, deviceId } = req.body;

    if (!biometricId || !timestamp) {
      return res.status(400).json({ message: 'biometricId and timestamp are required' });
    }

    // 1. Biometric ID se employee dhoondna
    const employee = await Employee.findOne({ biometricId });
    if (!employee) {
      return res.status(404).json({ message: 'No employee found with this biometric ID' });
    }

    const punchTime = new Date(timestamp);
    const dateOnly = new Date(punchTime.getFullYear(), punchTime.getMonth(), punchTime.getDate());

    // 2. Check karna ke aaj ki attendance pehle se bani hai ya nahi
    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: dateOnly,
    });

    if (!attendance) {
      // 3a. Pehli punch — matlab ye Check-In hai
      attendance = new Attendance({
        employeeId: employee._id,
        date: dateOnly,
        checkIn: punchTime,
        status: 'present',
        source: 'biometric',
      });
      await attendance.save();
      return res.status(201).json({ message: 'Check-in recorded', attendance });
    } else {
      // 3b. Doosri punch — matlab ye Check-Out hai
      attendance.checkOut = punchTime;
      await attendance.save();
      return res.status(200).json({ message: 'Check-out recorded', attendance });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;