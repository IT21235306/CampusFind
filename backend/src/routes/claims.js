const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');
const Claim = require('../models/Claim');
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const { fail, validate, objectId, asyncRoute } = require('../middleware/common');
const router = express.Router(); router.use(auth);
const detailsSchema = z.object({ identifyingDetails: z.string().trim().min(15).max(1000) });
function isOwner(item, userId) { return String(item.postedBy) === String(userId); }
router.get('/', asyncRoute(async (req, res) => {
  let filter;
  if (req.query.itemId) {
    const item = await Item.findById(objectId(req.query.itemId));
    if (!item) fail(404, 'Item not found.');
    if (!isOwner(item, req.userId)) fail(403, 'Only the finder can review these claims.');
    filter = { itemId: item._id };
  } else filter = { claimantId: req.userId };
  const claims = await Claim.find(filter).sort({ createdAt: -1 }).populate('itemId', 'title imageUrl status').populate('claimantId', 'name');
  res.json({ claims });
}));
router.post('/', asyncRoute(async (req, res) => {
  const input = validate(detailsSchema.extend({ itemId: z.string() }), req.body);
  const item = await Item.findById(objectId(input.itemId));
  if (!item) fail(404, 'Item not found.');
  if (isOwner(item, req.userId)) fail(403, 'You cannot claim your own item.');
  if (item.status !== 'Available') fail(409, 'This item has already been returned.');
  if (await Claim.exists({ itemId: item._id, claimantId: req.userId, status: 'Pending' })) fail(409, 'You already have a pending claim for this item.');
  const claim = await Claim.create({ itemId: item._id, claimantId: req.userId, identifyingDetails: input.identifyingDetails });
  if (!(await Item.exists({ _id: item._id, status: 'Available' }))) {
    claim.status = 'Rejected'; await claim.save();
    fail(409, 'This item has just been returned.');
  }
  res.status(201).json({ claim });
}));
router.get('/:id', asyncRoute(async (req, res) => {
  const claim = await Claim.findById(objectId(req.params.id)).populate('itemId', 'title imageUrl postedBy status').populate('claimantId', 'name');
  if (!claim) fail(404, 'Claim not found.');
  if (String(claim.claimantId._id) !== String(req.userId) && String(claim.itemId.postedBy) !== String(req.userId)) fail(403, 'This claim is private.');
  res.json({ claim });
}));
router.patch('/:id', asyncRoute(async (req, res) => {
  const claim = await Claim.findById(objectId(req.params.id));
  if (!claim) fail(404, 'Claim not found.');
  if (String(claim.claimantId) !== String(req.userId)) fail(403, 'This claim is private.');
  if (claim.status !== 'Pending') fail(409, 'Only pending claims can be edited.');
  claim.identifyingDetails = validate(detailsSchema, req.body).identifyingDetails;
  await claim.save(); res.json({ claim });
}));
router.delete('/:id', asyncRoute(async (req, res) => {
  const claim = await Claim.findById(objectId(req.params.id));
  if (!claim) fail(404, 'Claim not found.');
  const item = await Item.findById(claim.itemId);
  if (String(claim.claimantId) !== String(req.userId) && String(item?.postedBy) !== String(req.userId)) fail(403, 'This claim is private.');
  if (claim.status === 'Approved') fail(409, 'Approved claims must be retained as a return record.');
  await claim.deleteOne(); res.status(204).send();
}));
router.patch('/:id/status', asyncRoute(async (req, res) => {
  const { status } = validate(z.object({ status: z.enum(['Approved', 'Rejected', 'Cancelled']) }), req.body);
  const claim = await Claim.findById(objectId(req.params.id));
  if (!claim) fail(404, 'Claim not found.');
  const item = await Item.findById(claim.itemId);
  if (!item) fail(404, 'Item not found.');
  if (claim.status !== 'Pending') fail(409, 'This claim has already been decided.');
  if (status === 'Cancelled' && String(claim.claimantId) !== String(req.userId)) fail(403, 'Only the claimant can cancel.');
  if (status !== 'Cancelled' && !isOwner(item, req.userId)) fail(403, 'Only the finder can decide claims.');
  if (status === 'Approved') {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const changed = await Item.findOneAndUpdate({ _id: item._id, status: 'Available' }, { status: 'Returned' }, { returnDocument: 'after', session });
        if (!changed) fail(409, 'This item has already been returned.');
        const approved = await Claim.findOneAndUpdate({ _id: claim._id, status: 'Pending' }, { status: 'Approved' }, { returnDocument: 'after', session });
        if (!approved) fail(409, 'This claim has already been decided.');
        await Claim.updateMany({ itemId: item._id, _id: { $ne: claim._id }, status: 'Pending' }, { status: 'Rejected' }, { session });
      });
    } finally { await session.endSession(); }
    return res.json({ claim: await Claim.findById(claim._id), item: await Item.findById(item._id) });
  }
  claim.status = status; await claim.save(); res.json({ claim });
}));
module.exports = router;
