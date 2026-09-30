const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { fail, validate, asyncRoute } = require('../middleware/common');
const router = express.Router();
const email = z.email().max(150).transform((value) => value.trim().toLowerCase());
const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email, password: z.string().min(8).max(100) });
const loginSchema = z.object({ email, password: z.string().min(1) });
function safeUser(user) { return { id: String(user._id), name: user.name, email: user.email }; }
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
  res.json(session(user));
}));
router.get('/me', auth, asyncRoute(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) fail(401, 'Account no longer exists.');
  res.json({ user: safeUser(user) });
}));
module.exports = router;
