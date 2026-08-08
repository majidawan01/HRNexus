const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/authMiddleware');

// CREATE - Attendance mark karna (sirf admin/hr)
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Sab attendance records dekhna
router.get('/', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('employeeId', 'fullName employeeCode');
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Ek specific employee ki attendance dekhna
router.get('/employee/:employeeId', protect, async (req, res) => {
  try {
    const attendance = await Attendance.find({ employeeId: req.params.employeeId });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Attendance edit karna (sirf admin/hr)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Attendance record delete karna (sirf admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;