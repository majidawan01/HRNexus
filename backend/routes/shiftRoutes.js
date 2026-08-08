const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/authMiddleware');

// CREATE - Naya shift banana (sirf admin/hr)
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const shift = new Shift(req.body);
    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Sab shifts dekhna
router.get('/', protect, async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Shift edit karna (sirf admin/hr)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const shift = await Shift.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.status(200).json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Shift delete karna (sirf admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;