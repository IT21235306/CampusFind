require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../src/db');
const User = require('../src/models/User');

async function main() {
  await connectDB();
  const email = 'admin.campusfind@campusfind.local';
  const existing = await User.findOne({ email });
  if (existing) { console.log('Admin account already exists; existing password was not changed.'); return; }
  const password = crypto.randomBytes(24).toString('base64url');
  await User.create({ name: 'CampusFind Administrator', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', isActive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'admin-credentials.txt'), `Email: ${email}\nPassword: ${password}\n`, { mode: 0o600 });
  console.log('Admin account created. Credentials saved to ignored backend/admin-credentials.txt.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
