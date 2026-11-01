const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const { protect, authorize } = require('../middleware/authMiddleware');
const { tenant } = require('../middleware/tenant');

// Helper function - JWT token banana (id, role, companyId)
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, companyId: user.companyId || null },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const companyInfo = (company) =>
  company ? { _id: company._id, name: company.name, plan: company.plan, employeeLimit: company.employeeLimit } : null;

const userResponse = (user, company, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  companyId: user.companyId || null,
  company: companyInfo(company),
  token
});

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : email);

// REGISTER COMPANY - Nayi company + uska pehla admin (public)
router.post('/register-company', async (req, res) => {
  let company = null;
  try {
    const { companyName, adminName, email, password } = req.body;

    if (!companyName || !adminName || !email || !password) {
      return res.status(400).json({ message: 'companyName, adminName, email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    company = await Company.create({ name: companyName }); // plan free, limit 10

    // role hamesha admin; body se role nahi lete
    const user = new User({
      companyId: company._id,
      name: adminName,
      email: cleanEmail,
      password,
      role: 'admin'
    });

    try {
      await user.save();
    } catch (err) {
      await Company.findByIdAndDelete(company._id); // rollback
      throw err;
    }

    res.status(201).json(userResponse(user, company, generateToken(user)));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// REGISTER - Apni company mein naya user banana (sirf admin)
router.post('/register', protect, tenant, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, employeeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    // superadmin is route se kabhi nahi ban sakta
    const allowedRoles = ['admin', 'hr', 'manager', 'employee'];
    const finalRole = role || 'employee';
    if (!allowedRoles.includes(finalRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const cleanEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // employeeId diya ho to woh isi company ka hona chahiye
    if (employeeId) {
      const emp = await Employee.findOne({ _id: employeeId, companyId: req.companyId });
      if (!emp) {
        return res.status(400).json({ message: 'Employee not found in your company' });
      }
    }

    const user = new User({
      companyId: req.companyId,
      name,
      email: cleanEmail,
      password,
      role: finalRole,
      employeeId: employeeId || null
    });
    await user.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// LOGIN - User ko login karna
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    let company = null;
    if (user.role !== 'superadmin') {
      company = await Company.findById(user.companyId);
      if (!company) {
        return res.status(403).json({ message: 'Company not found' });
      }
    }

    res.status(200).json(userResponse(user, company, generateToken(user)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
