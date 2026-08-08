const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/authMiddleware');

// CREATE - Leave request apply karna (koi bhi logged-in user)
router.post('/', protect, async (req, res) => {
  try {
    const leave = new Leave(req.body);
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Sab leave requests dekhna (with employee details)
router.get('/', protect, async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employeeId', 'fullName employeeCode');
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Ek specific employee ki leaves dekhna
router.get('/employee/:employeeId', protect, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.params.employeeId });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Leave approve/reject karna (sirf admin/hr)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Leave request delete karna (sirf admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;