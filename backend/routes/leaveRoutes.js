const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');
const { stripTenantFields, employeeInCompany } = require('../utils/tenantHelpers');

// CREATE - Leave request apply karna (koi bhi logged-in user)
router.post('/', protect, tenant, async (req, res) => {
  try {
    if (!(await employeeInCompany(req.companyId, req.body.employeeId))) {
      return res.status(400).json({ message: 'Employee not found in your company' });
    }
    const leave = new Leave({ ...stripTenantFields(req.body), companyId: req.companyId });
    await leave.save();
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Apni company ki leave requests dekhna (with employee details)
router.get('/', protect, tenant, async (req, res) => {
  try {
    const leaves = await Leave.find({ companyId: req.companyId }).populate('employeeId', 'fullName employeeCode');
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Ek specific employee ki leaves dekhna
router.get('/employee/:employeeId', protect, tenant, async (req, res) => {
  try {
    const leaves = await Leave.find({ companyId: req.companyId, employeeId: req.params.employeeId });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Leave approve/reject karna (sirf admin/hr)
router.put('/:id', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    if (req.body.employeeId && !(await employeeInCompany(req.companyId, req.body.employeeId))) {
      return res.status(400).json({ message: 'Employee not found in your company' });
    }
    const leave = await Leave.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      stripTenantFields(req.body),
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
router.delete('/:id', protect, tenant, authorize('admin'), async (req, res) => {
  try {
    const leave = await Leave.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    res.status(200).json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
