const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Company = require('../models/Company');

// WEBHOOK - Biometric device se attendance receive karna
router.post('/webhook', async (req, res) => {
  try {
    // 0. Company ki pehchan: device har request mein company ki biometricKey bhejta hai
    //    (header `x-biometric-key` behtar hai; jo device header nahi bhej sakti woh ?key=... use kare)
    const key = req.get('x-biometric-key') || req.query.key;
    if (!key || typeof key !== 'string') {
      return res.status(401).json({ message: 'Biometric key required' });
    }
    const company = await Company.findOne({ biometricKey: key });
    if (!company) {
      return res.status(401).json({ message: 'Invalid biometric key' });
    }
    const companyId = company._id;

    // Device se aane wala data (ye format device/middleware ke mutabiq adjust hoga)
    const { biometricId, timestamp, deviceId } = req.body;

    if (!biometricId || !timestamp) {
      return res.status(400).json({ message: 'biometricId and timestamp are required' });
    }

    // 1. Biometric ID se employee dhoondna
    const employee = await Employee.findOne({ companyId, biometricId: String(biometricId) });
    if (!employee) {
      return res.status(404).json({ message: 'No employee found with this biometric ID' });
    }

    const punchTime = new Date(timestamp);
    if (isNaN(punchTime.getTime())) {
      return res.status(400).json({ message: 'Invalid timestamp' });
    }
    // Attendance ki `date` = punch ki Asia/Karachi (UTC+5) calendar date, UTC aadhi raat ke taur par store.
    // (Server ke local time par nahi: Vercel UTC hai, is se raat 00:00-05:00 PKT ki punch ghalat din mein jati.)
    const pktPunch = new Date(punchTime.getTime() + 5 * 60 * 60 * 1000);
    const dateOnly = new Date(Date.UTC(pktPunch.getUTCFullYear(), pktPunch.getUTCMonth(), pktPunch.getUTCDate()));

    // 2. Check karna ke aaj ki attendance pehle se bani hai ya nahi
    let attendance = await Attendance.findOne({
      companyId,
      employeeId: employee._id,
      date: dateOnly,
    });

    if (!attendance) {
      // 3a. Pehli punch — matlab ye Check-In hai
      attendance = new Attendance({
        companyId,
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