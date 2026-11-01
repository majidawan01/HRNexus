// Sirf superadmin banata hai:  npm run seed
// .env mein zaroori: SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD   (optional: SUPERADMIN_NAME)
// Credentials code mein hardcode nahi hain. Superadmin pehle se ho to kuch nahi karta.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const { MONGO_URI, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME } = process.env;
  if (!MONGO_URI) throw new Error('MONGO_URI .env mein nahi hai');
  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD) {
    throw new Error('.env mein SUPERADMIN_EMAIL aur SUPERADMIN_PASSWORD set karein');
  }
  if (SUPERADMIN_PASSWORD.length < 8) throw new Error('SUPERADMIN_PASSWORD kam az kam 8 characters ka ho');

  await mongoose.connect(MONGO_URI);

  const email = SUPERADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ $or: [{ role: 'superadmin' }, { email }] });
  if (existing) {
    console.log(`Skip: ${existing.role} "${existing.email}" pehle se maujood hai`);
    return;
  }

  await User.create({
    name: SUPERADMIN_NAME || 'Super Admin',
    email,
    password: SUPERADMIN_PASSWORD,
    role: 'superadmin',
    companyId: null
  });
  console.log(`Superadmin created: ${email}`);
}

run()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
