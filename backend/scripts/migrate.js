// Ek baar chalane wali migration script:  npm run migrate
// 1) "Default Company" banati hai (agar na ho) aur purane documents (jin ke paas companyId nahi) usay de deti hai
// 2) Purane global unique indexes drop karti hai
// 3) Naye (companyId wale) indexes bana deti hai
// Dobara chalane se koi nuqsan nahi (idempotent).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const Company = require('../models/Company');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Shift = require('../models/Shift');

const DEFAULT_COMPANY_NAME = 'Default Company';

// Purane indexes jo ab galat hain (global unique)
const OLD_INDEXES = [
  { model: Employee, name: 'employeeCode_1' },
  { model: Employee, name: 'email_1' },
  { model: Employee, name: 'biometricId_1' },
  { model: Payroll, name: 'employeeId_1_month_1_year_1' }
];

async function run() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI .env mein nahi hai');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  // 1. Default company
  const models = [User, Employee, Attendance, Leave, Payroll, Shift];
  const missing = { companyId: { $exists: false } };
  const nullOnes = { companyId: null };
  let pending = 0;
  for (const M of models) {
    pending += await M.countDocuments({ $or: [missing, nullOnes], ...(M === User ? { role: { $ne: 'superadmin' } } : {}) });
  }

  if (pending > 0) {
    let company = await Company.findOne({ name: DEFAULT_COMPANY_NAME });
    if (!company) {
      company = await Company.create({ name: DEFAULT_COMPANY_NAME, plan: 'pro', employeeLimit: null });
      console.log(`Created "${DEFAULT_COMPANY_NAME}" (${company._id}) with pro plan so existing data is not blocked`);
    }
    for (const M of models) {
      const filter = { $or: [missing, nullOnes] };
      if (M === User) filter.role = { $ne: 'superadmin' };
      const r = await M.updateMany(filter, { $set: { companyId: company._id } });
      console.log(`${M.modelName}: ${r.modifiedCount} documents assigned to default company`);
    }
  } else {
    console.log('Koi purana document nahi mila jis ko companyId chahiye');
  }

  // 2. Purane indexes drop
  for (const { model, name } of OLD_INDEXES) {
    try {
      await model.collection.dropIndex(name);
      console.log(`Dropped ${model.modelName}.${name}`);
    } catch (err) {
      if (err.codeName === 'IndexNotFound' || err.codeName === 'NamespaceNotFound' || err.code === 27 || err.code === 26) {
        console.log(`Skip ${model.modelName}.${name} (already gone)`);
      } else {
        throw err;
      }
    }
  }

  // 3. Naye indexes banana (syncIndexes baaki purane unused indexes bhi hata deta hai)
  for (const M of [Company, ...models]) {
    await M.syncIndexes();
    console.log(`Indexes synced: ${M.modelName}`);
  }

  console.log('Migration complete');
}

run()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
