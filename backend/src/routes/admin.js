const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const { fail, validate, objectId, asyncRoute } = require('../middleware/common');

const router = express.Router();
router.use(auth, (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required.' }));
const userFields = 'name email role isActive avatarUrl createdAt';

router.get('/overview', asyncRoute(async (req, res) => {
  const [users, items, pendingClaims, hiddenItems] = await Promise.all([
    User.countDocuments(), Item.countDocuments(), Claim.countDocuments({ status: 'Pending' }), Item.countDocuments({ isHidden: true }),
  ]);
  res.json({ users, items, pendingClaims, hiddenItems });
}));
router.get('/users', asyncRoute(async (req, res) => {
  const users = await User.find().select(userFields).sort({ createdAt: -1 }).limit(200);
  res.json({ users });
}));
router.patch('/users/:id', asyncRoute(async (req, res) => {
  const { isActive, role } = validate(z.object({ isActive: z.boolean().optional(), role: z.enum(['member', 'admin']).optional() }).refine(v => Object.keys(v).length > 0), req.body);
  const user = await User.findById(objectId(req.params.id));
  if (!user) fail(404, 'User not found.');
  if (String(user._id) === String(req.userId) && (isActive === false || role === 'member')) fail(409, 'You cannot remove your own admin access.');
  if ((isActive === false || role === 'member') && user.role === 'admin' && user.isActive !== false && await User.countDocuments({ role: 'admin', isActive: { $ne: false } }) <= 1) fail(409, 'At least one active admin is required.');
  if (isActive !== undefined) user.isActive = isActive;
  if (role !== undefined) user.role = role;
  await user.save();
  res.json({ user: await User.findById(user._id).select(userFields) });
}));
router.get('/items', asyncRoute(async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 }).limit(200).populate('postedBy', 'name email');
  res.json({ items });
}));
router.patch('/items/:id', asyncRoute(async (req, res) => {
  const { isHidden } = validate(z.object({ isHidden: z.boolean() }), req.body);
  const item = await Item.findById(objectId(req.params.id));
  if (!item) fail(404, 'Item not found.');
  item.isHidden = isHidden;
  await item.save();
  res.json({ item });
}));
router.get('/claims', asyncRoute(async (req, res) => {
  const claims = await Claim.find().sort({ createdAt: -1 }).limit(200).populate('itemId', 'title status').populate('claimantId', 'name email');
  res.json({ claims });
}));
router.patch('/claims/:id', asyncRoute(async (req, res) => {
  const { status } = validate(z.object({ status: z.literal('Rejected') }), req.body);
  const claim = await Claim.findById(objectId(req.params.id));
  if (!claim) fail(404, 'Claim not found.');
  if (claim.status !== 'Pending') fail(409, 'Only pending claims can be moderated.');
  claim.status = status;
  await claim.save();
  res.json({ claim });
}));
module.exports = router;
