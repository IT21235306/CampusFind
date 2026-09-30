require('dotenv').config();
const { connectDB } = require('../src/db');
const User = require('../src/models/User');
const mongoose = require('mongoose');

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error('Set ADMIN_EMAIL to the email of an existing private account.');
  await connectDB();
  const user = await User.findOne({ email });
  if (!user) throw new Error('Register the admin account in the app first.');
  user.role = 'admin';
  user.isActive = true;
  await user.save();
  console.log(`Admin access granted to ${user.email}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
