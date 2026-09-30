const express = require('express');
const multer = require('multer');
const { saveImage, deleteImage } = require('../storage');
const { z } = require('zod');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const { fail, validate, objectId, own, asyncRoute } = require('../middleware/common');
const router = express.Router(); router.use(auth);
function present(item, req) { const data = item.toObject(); if (data.imageUrl?.startsWith('/')) data.imageUrl = `${req.protocol}://${req.get('host')}${data.imageUrl}`; return data; }
const categories = ['Electronics', 'ID & cards', 'Bags', 'Keys', 'Clothing', 'Books', 'Other'];
const itemSchema = z.object({
  title: z.string().trim().min(3).max(100), description: z.string().trim().min(15).max(1200),
  category: z.enum(categories), foundLocation: z.string().trim().min(3).max(120),
  foundDate: z.iso.date().refine((value) => value <= new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10), 'Date cannot be in the future.'),
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 }, fileFilter(req, file, cb) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return cb(Object.assign(new Error('Choose a JPG, PNG, or WebP image.'), { status: 400 }));
  cb(null, true);
} });
router.get('/', asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.mine === 'true') filter.postedBy = req.userId;
  else { filter.isHidden = { $ne: true }; if (req.query.status !== 'all') filter.status = 'Available'; }
  if (req.query.category && categories.includes(req.query.category)) filter.category = req.query.category;
  if (req.query.search) { const search = String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = [{ title: { $regex: search, $options: 'i' } }, { foundLocation: { $regex: search, $options: 'i' } }]; }
  const items = await Item.find(filter).sort({ createdAt: -1 }).limit(100).populate('postedBy', 'name');
  res.json({ items: items.map((item) => present(item, req)) });
}));
router.post('/', asyncRoute(async (req, res) => {
  const input = validate(itemSchema, req.body);
  const item = await Item.create({ ...input, postedBy: req.userId });
  res.status(201).json({ item: present(item, req) });
}));
router.get('/:id', asyncRoute(async (req, res) => {
  const item = await Item.findById(objectId(req.params.id)).populate('postedBy', 'name');
  if (!item || (item.isHidden && String(item.postedBy?._id) !== String(req.userId) && req.user.role !== 'admin')) fail(404, 'Item not found.'); res.json({ item: present(item, req) });
}));
router.patch('/:id', asyncRoute(async (req, res) => {
  const item = await Item.findById(objectId(req.params.id));
  if (!item) fail(404, 'Item not found.'); own(item, req.userId);
  if (item.status !== 'Available') fail(409, 'Returned items cannot be edited.');
  const input = validate(itemSchema.partial().refine((value) => Object.keys(value).length > 0), req.body);
  Object.assign(item, input); await item.save(); res.json({ item: present(item, req) });
}));
router.delete('/:id', asyncRoute(async (req, res) => {
  const item = await Item.findById(objectId(req.params.id));
  if (!item) fail(404, 'Item not found.'); own(item, req.userId);
  if (await Claim.exists({ itemId: item._id })) fail(409, 'Remove the claims for this item before deleting it.');
  await item.deleteOne();
  if (item.imageFileId) await deleteImage(item.imageFileId).catch(console.error);
  res.status(204).send();
}));
router.post('/:id/image', upload.single('image'), asyncRoute(async (req, res) => {
  const item = await Item.findById(objectId(req.params.id));
  if (!item) fail(404, 'Item not found.'); own(item, req.userId);
  if (item.status !== 'Available') fail(409, 'Returned items cannot be edited.');
  if (!req.file) fail(400, 'Choose an image.');
  const bytes = req.file.buffer;
  const actual = bytes[0] === 0xff && bytes[1] === 0xd8 ? 'image/jpeg' : bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : '';
  if (actual !== req.file.mimetype) fail(400, 'The selected file is not a valid image.');
  const oldId = item.imageFileId;
  const fileId = await saveImage(bytes, req.file.originalname, actual);
  item.imageFileId = fileId; item.imageUrl = `/api/images/${fileId}`; await item.save();
  if (oldId) await deleteImage(oldId).catch(console.error);
  res.json({ item: present(item, req) });
}));
module.exports = router;
