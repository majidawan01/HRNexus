const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/authMiddleware');

// CREATE - Naya employee add karna (sirf admin/hr)
router.post('/', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Sab employees dekhna (koi bhi logged-in user)
router.get('/', protect, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Employee ka data edit karna (sirf admin/hr)
router.put('/:id', protect, authorize('admin', 'hr'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
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
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;