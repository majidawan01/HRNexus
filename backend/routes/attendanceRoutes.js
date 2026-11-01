const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');
const { stripTenantFields, employeeInCompany } = require('../utils/tenantHelpers');

// CREATE - Attendance mark karna (sirf admin/hr)
router.post('/', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (!(await employeeInCompany(req.companyId, req.body.employeeId))) {
      return res.status(400).json({ message: 'Employee not found in your company' });
    }
    const attendance = new Attendance({ ...stripTenantFields(req.body), companyId: req.companyId });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Apni company ke attendance records dekhna
router.get('/', protect, tenant, async (req, res) => {
  try {
    const attendance = await Attendance.find({ companyId: req.companyId }).populate('employeeId', 'fullName employeeCode');
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Ek specific employee ki attendance dekhna
router.get('/employee/:employeeId', protect, tenant, async (req, res) => {
  try {
    const attendance = await Attendance.find({ companyId: req.companyId, employeeId: req.params.employeeId });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Attendance edit karna (sirf admin/hr)
router.put('/:id', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (req.body.employeeId && !(await employeeInCompany(req.companyId, req.body.employeeId))) {
      return res.status(400).json({ message: 'Employee not found in your company' });
    }
    const attendance = await Attendance.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      stripTenantFields(req.body),
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
router.delete('/:id', protect, tenant, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
