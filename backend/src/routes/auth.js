const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const { saveImage, deleteImage, imageType } = require('../storage');
const { fail, validate, asyncRoute } = require('../middleware/common');
const router = express.Router();
const email = z.email().max(150).transform((value) => value.trim().toLowerCase());
const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email, password: z.string().min(8).max(100) });
const loginSchema = z.object({ email, password: z.string().min(1) });
function safeUser(user) { return { id: String(user._id), name: user.name, email: user.email, role: user.role || 'member', avatarUrl: user.avatarUrl || '' }; }
function session(user) { return { token: jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: safeUser(user) }; }
router.post('/register', asyncRoute(async (req, res) => {
  const input = validate(registerSchema, req.body);
  if (await User.exists({ email: input.email })) fail(409, 'This email is already registered.');
  const user = await User.create({ name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12) });
  res.status(201).json(session(user));
}));
router.post('/login', asyncRoute(async (req, res) => {
  const input = validate(loginSchema, req.body);
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) fail(401, 'Incorrect email or password.');
  if (user.isActive === false) fail(403, 'This account is unavailable.');
  res.json(session(user));
}));
router.get('/me', auth, asyncRoute(async (req, res) => {
  res.json({ user: safeUser(req.user) });
}));
router.patch('/me', auth, asyncRoute(async (req, res) => {
  const { name } = validate(z.object({ name: z.string().trim().min(2).max(80) }), req.body);
  req.user.name = name;
  await req.user.save();
  res.json({ user: safeUser(req.user) });
}));
const avatarUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });
router.post('/me/avatar', auth, avatarUpload.single('image'), asyncRoute(async (req, res) => {
  if (!req.file) fail(400, 'Choose a profile photo.');
  const actual = imageType(req.file.buffer);
  if (!actual || actual !== req.file.mimetype) fail(400, 'Choose a valid JPG, PNG, or WebP image.');
  const oldId = req.user.avatarFileId;
  const fileId = await saveImage(req.file.buffer, req.file.originalname, actual);
  req.user.avatarFileId = fileId;
  req.user.avatarUrl = `/api/images/${fileId}`;
  await req.user.save();
  if (oldId) await deleteImage(oldId).catch(console.error);
  res.json({ user: safeUser(req.user) });
}));
module.exports = router;
