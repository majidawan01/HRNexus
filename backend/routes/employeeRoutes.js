const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');
const { stripTenantFields } = require('../utils/tenantHelpers');

// CREATE - Naya employee add karna (sirf admin/hr)
router.post('/', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    // Plan limit check (free = 10; pro/null = unlimited)
    const limit = req.company.employeeLimit;
    if (req.company.plan !== 'pro' && limit != null) {
      const count = await Employee.countDocuments({ companyId: req.companyId });
      if (count >= limit) {
        return res.status(403).json({
          code: 'PLAN_LIMIT',
          message: `Employee limit reached (${limit}) on the ${req.company.plan} plan. Upgrade to Pro to add more.`
        });
      }
    }

    const employee = new Employee({ ...stripTenantFields(req.body), companyId: req.companyId });
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Apni company ke employees dekhna (koi bhi logged-in user)
router.get('/', protect, tenant, async (req, res) => {
  try {
    const employees = await Employee.find({ companyId: req.companyId });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Employee ka data edit karna (sirf admin/hr)
router.put('/:id', protect, tenant, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, companyId: req.companyId },
      stripTenantFields(req.body),
      { new: true, runValidators: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Employee ko remove karna (sirf admin)
router.delete('/:id', protect, tenant, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, companyId: req.companyId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
