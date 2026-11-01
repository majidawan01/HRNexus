const Company = require('../models/Company');

// protect ke BAAD lagana hai. Token se companyId nikal kar req.companyId / req.company set karta hai.
// Har tenant route is middleware se guzray ga, aur queries mein req.companyId hi use hogi
// (kabhi req.body / req.query se companyId nahi lena).
const tenant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Superadmin kisi company ka nahi hota; tenant routes uske liye nahi hain
    if (req.user.role === 'superadmin' || !req.user.companyId) {
      return res.status(403).json({ message: 'Company account required for this route' });
    }

    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(403).json({ message: 'Company not found or removed' });
    }

    req.companyId = company._id;
    req.company = company;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { tenant };
