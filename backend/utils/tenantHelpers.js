const mongoose = require('mongoose');
const Employee = require('../models/Employee');

// Request body se companyId / _id hata deta hai, taake koi client doosri company mein data na daal sake
const stripTenantFields = (body) => {
  const { companyId, _id, ...rest } = body || {};
  return rest;
};

// Kya yeh employee isi company ka hai?
const employeeInCompany = async (companyId, employeeId) => {
  if (!employeeId || !mongoose.isValidObjectId(employeeId)) return false;
  return !!(await Employee.exists({ _id: employeeId, companyId }));
};

module.exports = { stripTenantFields, employeeInCompany };
