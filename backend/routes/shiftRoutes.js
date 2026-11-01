const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');
const { stripTenantFields } = require('../utils/tenantHelpers');

// CREATE - Naya shift banana (sirf admin/hr)
router.post('/', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    const shift = new Shift({ ...stripTenantFields(req.body), companyId: req.companyId });
    await shift.save();
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Apni company ke shifts dekhna
router.get('/', protect, tenant, async (req, res) => {
  try {
    const shifts = await Shift.find({ companyId: req.companyId });
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Shift edit karna (sirf admin/hr)
router.put('/:id', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      stripTenantFields(req.body),
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
router.delete('/:id', protect, tenant, authorize('admin'), async (req, res) => {
  try {
    const shift = await Shift.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
