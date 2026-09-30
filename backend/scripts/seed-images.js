require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../src/db');
const { saveImage } = require('../src/storage');
const Item = require('../src/models/Item');
const artwork = [
  ['Wireless earbuds in navy case', 'earbuds.png'],
  ['Student ID card in clear holder', 'id-card.png'],
  ['Black insulated water bottle', 'bottle.png'],
  ['Tan canvas backpack', 'backpack.png'],
  ['Notebook with orange cover', 'notebook.png'],
  ['Silver key ring with blue tag', 'keys.png'],
  ['Grey zip-up hoodie', 'hoodie.png'],
];
async function main() {
  await connectDB(); let uploaded = 0;
  for (const [title, filename] of artwork) {
    const item = await Item.findOne({ title });
    if (!item || item.imageFileId) continue;
    const bytes = fs.readFileSync(path.join(__dirname, '../../mobile/assets/demo', filename));
    const id = await saveImage(bytes, filename, 'image/png');
    item.imageFileId = id; item.imageUrl = `/api/images/${id}`; await item.save(); uploaded++;
  }
  console.log(`Added ${uploaded} item illustrations to Atlas; ${await Item.countDocuments({ imageFileId: { $exists: true } })} items now have images.`);
}
main().catch((error) => { console.error('Image seed failed:', error.name, error.code || '', error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
