require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../src/db');
const User = require('../src/models/User');
const Item = require('../src/models/Item');
const Claim = require('../src/models/Claim');
const users = [
  { name: 'Nethmi Perera', email: 'nethmi.demo@campusfind.local' },
  { name: 'Kavindu Silva', email: 'kavindu.demo@campusfind.local' },
  { name: 'Amaya Fernando', email: 'amaya.demo@campusfind.local' },
];
function daysAgo(days) { const date = new Date(); date.setDate(date.getDate() - days); return date; }
async function main() {
  if (!process.env.DEMO_PASSWORD || process.env.DEMO_PASSWORD.length < 8) throw new Error('Set DEMO_PASSWORD (8+ characters) before seeding.');
  await connectDB(); await Promise.all([User.init(), Item.init(), Claim.init()]);
  const ids = {};
  for (const user of users) {
    const passwordHash = await bcrypt.hash(process.env.DEMO_PASSWORD, 12);
    const record = await User.findOneAndUpdate({ email: user.email }, { $set: { name: user.name, passwordHash } }, { upsert: true, returnDocument: 'after', runValidators: true });
    ids[user.email] = record._id;
  }
  const samples = [
    ['Wireless earbuds in navy case', 'Electronics', 'Found a pair of earbuds inside a dark navy charging case. A small sticker is attached to the underside.', 'Main Library · Level 2', 1, 0],
    ['Student ID card in clear holder', 'ID & cards', 'A student identification card was found inside a clear plastic holder near the entrance.', 'Malabe Main Gate', 2, 1],
    ['Black insulated water bottle', 'Other', 'A matte black metal bottle with a distinctive mark near the lid was left behind after class.', 'New Academic Building · Level 3', 2, 0],
    ['Tan canvas backpack', 'Bags', 'A light tan canvas backpack with two front pockets and a side bottle holder was found.', 'Engineering Building · Ground Floor', 3, 2],
    ['Notebook with orange cover', 'Books', 'An orange-covered ruled notebook containing handwritten study notes was found on a desk.', 'Computing Faculty · Lab 4', 4, 1],
    ['Silver key ring with blue tag', 'Keys', 'A small set of keys on a silver ring with a blue plastic tag was found near the food court.', 'Campus Food Court', 5, 2],
    ['Grey zip-up hoodie', 'Clothing', 'A medium-sized grey hoodie was left on a chair after an afternoon lecture.', 'Auditorium · Rear Seating', 6, 0],
  ];
  const itemIds = [];
  for (const [title, category, description, foundLocation, age, owner] of samples) {
    const record = await Item.findOneAndUpdate({ title, postedBy: ids[users[owner].email] }, { $setOnInsert: { title, category, description, foundLocation, foundDate: daysAgo(age), postedBy: ids[users[owner].email], status: 'Available' } }, { upsert: true, returnDocument: 'after', runValidators: true });
    itemIds.push(record._id);
  }
  const claimSamples = [
    [0, 1, 'The underside of my earbuds case has a tiny star sticker and the left earbud has a scratched edge.', 'Pending'],
    [3, 0, 'My backpack contains a blue pencil case and the inside lining has a stitched name label.', 'Pending'],
    [5, 1, 'The blue tag on my key ring has a handwritten room number on its reverse side.', 'Pending'],
  ];
  for (const [index, claimant, identifyingDetails, status] of claimSamples) {
    const itemId = itemIds[index], claimantId = ids[users[claimant].email];
    if (!(await Claim.exists({ itemId, claimantId }))) await Claim.create({ itemId, claimantId, identifyingDetails, status });
  }
  console.log(`Atlas ready: ${await User.countDocuments()} users, ${await Item.countDocuments()} items, ${await Claim.countDocuments()} claims.`);
}
main().catch((error) => { console.error('Seed failed:', error.name, error.code || '', String(error.message).replace(/mongodb(?:\+srv)?:\/\/[^@]+@/g, 'mongodb://***@')); process.exitCode = 1; }).finally(() => mongoose.disconnect());
